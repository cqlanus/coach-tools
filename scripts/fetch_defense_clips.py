#!/usr/bin/env python3
"""
fetch_defense_clips.py — Defense Clip Finder for coach-tools
=============================================================
Queries Baseball Savant (CSV export) and the MLB Stats API to find
the top 3 video clips per defensive scenario and writes the result to
apps/web/src/data/defense-clips.json.

Usage:
    pip install requests pandas
    python3 scripts/fetch_defense_clips.py

Output: apps/web/src/data/defense-clips.json

Scenario key format: "{base}:{play_type}"  e.g. "100:gb_ss"
Base code:  3 digits, 1=runner present  [1st, 2nd, 3rd]
            "100" = runner on 1st only
"""

import json
import sys
import time
from io import StringIO
from pathlib import Path

try:
    import requests
    import pandas as pd
except ImportError:
    sys.exit("pip install requests pandas")

# ── Config ────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).parent.parent
OUT_PATH = ROOT / "apps" / "web" / "src" / "data" / "defense-clips.json"

SEASONS = ["2024", "2023"]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/csv,*/*",
    "Referer": "https://baseballsavant.mlb.com/statcast_search",
}

BASE_STATES = ["000", "100", "010", "001", "110", "101", "011", "111"]

# ── Scenario definitions ──────────────────────────────────────────────────────

SCENARIOS = []

# Infield ground balls (48 scenarios)
INFIELD = [
    ("1", "gb_p"),
    ("2", "gb_c"),
    ("3", "gb_1b"),
    ("4", "gb_2b"),
    ("5", "gb_3b"),
    ("6", "gb_ss"),
]
for base in BASE_STATES:
    for loc, play_type in INFIELD:
        SCENARIOS.append({
            "key": f"{base}:{play_type}",
            "base": base,
            "event": "field_out",
            "loc_filter": int(loc),
            "bb_filter": "ground_ball",
            "hc_filter": None,
            "is_outfield": False,
        })

# Outfield singles (24 scenarios)
OUTFIELD = [
    ("7", "gb_lf"),
    ("8", "gb_cf"),
    ("9", "gb_rf"),
]
for base in BASE_STATES:
    for loc, play_type in OUTFIELD:
        SCENARIOS.append({
            "key": f"{base}:{play_type}",
            "base": base,
            "event": "single",
            "loc_filter": int(loc),
            "bb_filter": None,       # no bb_type filter for outfield singles
            "hc_filter": None,
            "is_outfield": True,
        })

# Doubles (32 scenarios)
DBL_TYPES = {
    "dbl_ll": ("double", lambda df: df[df["hc_x"] < 70]),
    "dbl_rl": ("double", lambda df: df[df["hc_x"] > 150]),
    "dbl_lg": ("double", lambda df: df[(df["hc_x"] >= 70)  & (df["hc_x"] < 105)]),
    "dbl_rg": ("double", lambda df: df[(df["hc_x"] >= 105) & (df["hc_x"] <= 150)]),
}
for base in BASE_STATES:
    for play_type, (event, hc_fn) in DBL_TYPES.items():
        SCENARIOS.append({
            "key": f"{base}:{play_type}",
            "base": base,
            "event": event,
            "loc_filter": None,
            "bb_filter": None,
            "hc_filter": hc_fn,
            "is_outfield": True,     # doubles use same high-xBA scoring as outfield
        })


# ── Savant CSV fetch ──────────────────────────────────────────────────────────

def fetch_savant_csv(event_type, season):
    """Fetch broad Statcast CSV for one event type + season, split into 2-month chunks."""
    chunks = [("04-01", "05-31"), ("06-01", "07-31"), ("08-01", "09-30")]
    frames = []
    for gt, lt in chunks:
        url = (
            "https://baseballsavant.mlb.com/statcast_search/csv"
            f"?all=true"
            f"&hfGT=R%7C"
            f"&hfSea={season}%7C"
            f"&player_type=batter"
            f"&hfAB={event_type}%7C"
            f"&min_results=0"
            f"&group_by=name"
            f"&sort_col=pitches"
            f"&sort_order=desc"
            f"&min_abs=0"
            f"&type=details"
            f"&game_date_gt={season}-{gt}"
            f"&game_date_lt={season}-{lt}"
        )
        for attempt in range(3):
            try:
                resp = requests.get(url, headers=HEADERS, timeout=60)
                if resp.status_code == 200 and "pitch_type" in resp.text[:200]:
                    text = resp.text.lstrip("﻿")
                    df = pd.read_csv(StringIO(text), low_memory=False)
                    if len(df) > 0:
                        frames.append(df)
                    break
                time.sleep(4)
            except Exception as e:
                print(f"    fetch error (attempt {attempt + 1}): {e}")
                time.sleep(5)
        time.sleep(1.5)
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()


# ── Runner filtering ──────────────────────────────────────────────────────────

def filter_runners(df, base_code):
    r1, r2, r3 = base_code[0] == "1", base_code[1] == "1", base_code[2] == "1"
    mask = pd.Series(True, index=df.index)
    mask &= df["on_1b"].notna() if r1 else df["on_1b"].isna()
    mask &= df["on_2b"].notna() if r2 else df["on_2b"].isna()
    mask &= df["on_3b"].notna() if r3 else df["on_3b"].isna()
    return df[mask]


# ── Scoring ───────────────────────────────────────────────────────────────────

def score_play(row, is_outfield):
    """
    Score a play candidate for clip quality.

    Infield:  prefer low xBA (routine play) + flat launch angle
    Outfield: prefer high xBA (solid contact that clearly reaches the outfield)
    Both:     prefer 0 outs and recent season
    """
    score = 0
    try:
        if pd.notna(row.get("outs_when_up")) and int(row["outs_when_up"]) == 0:
            score += 3
        if pd.notna(row.get("game_year")) and int(row["game_year"]) == 2024:
            score += 1

        xba = row.get("estimated_ba_using_speedangle")
        if is_outfield:
            if pd.notna(xba) and float(xba) > 0.50:
                score += 2
        else:
            if pd.notna(xba) and float(xba) < 0.15:
                score += 2
            la = row.get("launch_angle")
            if pd.notna(la) and -10 <= float(la) <= 10:
                score += 1
    except (ValueError, TypeError):
        pass
    return score


# ── Play ID resolution ────────────────────────────────────────────────────────

_play_id_cache = {}


def get_play_id(game_pk, at_bat_number, session):
    gpk = int(game_pk)
    abn = int(at_bat_number)

    if gpk not in _play_id_cache:
        url = f"https://statsapi.mlb.com/api/v1/game/{gpk}/playByPlay"
        try:
            resp = session.get(url, timeout=20)
            if resp.status_code == 200:
                plays = resp.json().get("allPlays", [])
                _play_id_cache[gpk] = {}
                for play in plays:
                    ab = play.get("about", {}).get("atBatIndex")
                    evs = play.get("playEvents", [])
                    pid = evs[-1].get("playId") if evs else None
                    if ab is not None and pid:
                        _play_id_cache[gpk][ab] = pid
            else:
                _play_id_cache[gpk] = {}
        except Exception:
            _play_id_cache[gpk] = {}
        time.sleep(0.1)

    return _play_id_cache[gpk].get(abn - 1)


def video_url(play_id):
    return f"https://baseballsavant.mlb.com/sporty-videos?playId={play_id}"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 64)
    print("Defense Clip Finder — coach-tools")
    print("=" * 64)
    print(f"Scenarios : {len(SCENARIOS)}")
    print(f"Seasons   : {SEASONS}")
    print(f"Output    : {OUT_PATH}\n")

    # Phase 1: fetch broad CSVs, cached by (event, season)
    needed = sorted(set((sc["event"], yr) for sc in SCENARIOS for yr in SEASONS))
    print(f"Phase 1 : Fetching {len(needed)} broad CSVs from Baseball Savant")
    print("          (2-month chunks, ~15-25 min total)\n")

    cache = {}
    for i, (event, season) in enumerate(needed, 1):
        print(f"  [{i}/{len(needed)}] {event} {season} ... ", end="", flush=True)
        df = fetch_savant_csv(event, season)
        if df.empty:
            print("EMPTY ⚠")
        else:
            print(f"{len(df):,} rows")
        cache[(event, season)] = df
        time.sleep(2)

    # Phase 2: filter, score, resolve play IDs
    print(f"\nPhase 2 : Processing {len(SCENARIOS)} scenarios\n")

    session = requests.Session()
    session.headers.update({"User-Agent": HEADERS["User-Agent"]})

    output = {}

    for i, sc in enumerate(SCENARIOS, 1):
        key = sc["key"]
        base = sc["base"]
        is_outfield = sc["is_outfield"]

        frames = [cache.get((sc["event"], yr), pd.DataFrame()) for yr in SEASONS]
        df = pd.concat([f for f in frames if not f.empty], ignore_index=True)

        if df.empty:
            continue

        # Post-fetch filters
        if sc["loc_filter"] is not None:
            df = df[df["hit_location"] == sc["loc_filter"]]
        if sc["bb_filter"] is not None:
            df = df[df["bb_type"] == sc["bb_filter"]]
        if sc["hc_filter"] is not None:
            try:
                df = sc["hc_filter"](df)
            except Exception:
                pass
        df = filter_runners(df, base)

        if df.empty:
            print(f"  [{i:3d}/{len(SCENARIOS)}] {key:<20} → 0 plays")
            continue

        df = df.copy()
        df["_score"] = df.apply(lambda r: score_play(r, is_outfield), axis=1)
        df = df.sort_values("_score", ascending=False).head(10)

        print(f"  [{i:3d}/{len(SCENARIOS)}] {key:<20} → resolving IDs...", end="", flush=True)

        clips = []
        for _, row in df.iterrows():
            if len(clips) >= 3:
                break
            gpk = row.get("game_pk")
            abn = row.get("at_bat_number")
            if pd.isna(gpk) or pd.isna(abn):
                continue
            play_id = get_play_id(int(gpk), int(abn), session)
            if play_id:
                clips.append({
                    "play_id":   play_id,
                    "video_url": video_url(play_id),
                    "game_date": str(row.get("game_date", ""))[:10],
                    "matchup":   f"{row.get('away_team', '')} @ {row.get('home_team', '')}",
                })

        print(f" {len(clips)} clip{'s' if len(clips) != 1 else ''}")

        if clips:
            output[key] = clips

    # Write output
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    # Summary
    total = len(SCENARIOS)
    with_clips = len(output)
    full_three = sum(1 for v in output.values() if len(v) == 3)
    print(f"\n{'=' * 64}")
    print(f"Done!")
    print(f"  Scenarios total  : {total}")
    print(f"  With ≥1 clip     : {with_clips} ({with_clips * 100 // total}%)")
    print(f"  With 3 clips     : {full_three}")
    print(f"  Written to       : {OUT_PATH}")


if __name__ == "__main__":
    main()
