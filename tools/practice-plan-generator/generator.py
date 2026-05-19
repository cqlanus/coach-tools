#!/usr/bin/env python3
"""
LGLL Practice Plan Generator  v2
La Grange Little League | Ages 7-9

Practice structure:
  OPENING   (~25-30 min)  Warmup → baserunning → throwing  [whole team, sequential]
  STATIONS  (~25-30 min)  2-3 simultaneous small-group stations [rotate on whistle]
  TEAM TIME (~25-30 min)  Whole-team game-like or situational activity
  CLOSURE   (5 min)       Huddle

For 60-minute practices: Opening + either Stations OR Team Time (not both).
"""

import yaml
import random
import argparse
from datetime import date
from pathlib import Path

BASE_DIR   = Path(__file__).parent
DATA_DIR   = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Constants ─────────────────────────────────────────────────────────────────

LOCATIONS = {
    "field":    "On the Field (outdoor, full diamond)",
    "overtime": "Overtime Sports (turf cages, limited space)",
    "gym":      "LTHS Gym (indoor, no live balls)",
}

FOCUS_OPTIONS = {
    "balanced":    "Balanced (all skill areas)",
    "throwing":    "Throwing & Arm",
    "hitting":     "Hitting",
    "fielding":    "Fielding",
    "baserunning": "Base Running",
    "situations":  "Situations & Team Concept",
    "pitching":    "Pitching",
    "catching":    "Catching",
}

# Phase time budgets: (opening, stations, team, closure)
PHASE_BUDGETS = {
    90:  {"opening": 25, "stations": 30, "team": 25, "closure": 5},
    120: {"opening": 30, "stations": 35, "team": 45, "closure": 5},
}

def sixty_min_phases(location, focus):
    """For 60-min practices, pick stations OR team time based on context."""
    use_team = (focus in ("situations", "baserunning") or location == "field")
    if use_team:
        return {"opening": 15, "stations":  0, "team": 35, "closure": 5}
    else:
        return {"opening": 15, "stations": 35, "team":  0, "closure": 5}

# Station slot compositions by focus: list of (station_role, display_label)
STATION_COMPOSITIONS = {
    "balanced":    [("station_hitting",  "Hitting"),
                    ("station_fielding", "Fielding"),
                    ("station_pitching", "Pitching / Arm Care")],
    "hitting":     [("station_hitting",  "Hitting — Station A"),
                    ("station_hitting",  "Hitting — Station B"),
                    ("station_fielding", "Fielding")],
    "fielding":    [("station_fielding", "Fielding — Station A"),
                    ("station_fielding", "Fielding — Station B"),
                    ("station_hitting",  "Hitting")],
    "throwing":    [("station_throwing", "Relay / Arm"),
                    ("station_fielding", "Fielding"),
                    ("station_hitting",  "Hitting")],
    "pitching":    [("station_pitching", "Pitching"),
                    ("station_hitting",  "Hitting"),
                    ("station_fielding", "Fielding")],
    "catching":    [("station_catching", "Catching"),
                    ("station_hitting",  "Hitting"),
                    ("station_fielding", "Fielding")],
    "situations":  [("station_fielding", "Fielding"),
                    ("station_hitting",  "Hitting"),
                    ("station_pitching", "Pitching / Arm Care")],
    "baserunning": [("station_fielding", "Fielding"),
                    ("station_hitting",  "Hitting"),
                    ("station_throwing", "Relay / Arm")],
}

# Opening sub-arc buckets
_WARMUP_IDS = {
    "filter_in_stations", "dynamic_warmup_bases", "dynamic_warmup_full_progression",
    "dynamic_warmup_agility", "karaoke_skips_jumps_crawls", "stretching_routine",
}
_BASERUNNING_IDS = {
    "dynamic_warmup_baserunning_sequence", "hard_90_run_through_first",
    "rounding_first_banana_route", "first_to_third_drill",
    "second_to_home_drill", "tag_from_third",
}
_THROWING_IDS = {
    "four_seam_grip_intro", "ten_toes", "wrist_flips", "torso_twist_throws",
    "one_knee_throwing", "step_and_throw", "full_throwing_progression",
    "crow_hop_throw", "shuffle_throw", "relay_drill", "quick_toss",
}

GAME_LIKE_TEAM_IDS = {
    "two_pitch_game", "game_situation_scrimmage", "live_bp_rotation",
    "live_bp_wiffle_rotation", "fielding_doubles_game", "fielding_singles_game",
    "infield_outfield_combined",
}
INSTRUCTIVE_TEAM_IDS = {
    "ball_base_backup_intro", "force_vs_tag_drill", "infield_movement_drill",
    "infield_cutoff_outfield_hit", "runner_on_second_read", "calling_for_ball_drill",
    "cutoff_relay_situations", "mi_covering_second_drill", "outfield_communication",
    "base_to_base_team_drill",
}


# ── Data ──────────────────────────────────────────────────────────────────────

def load_drills():
    with open(DATA_DIR / "drills.yaml") as f:
        return yaml.safe_load(f)["drills"]


# ── Helpers ───────────────────────────────────────────────────────────────────

def available(drill, location, coaches):
    return (location in drill.get("locations", [])
            and drill.get("coaches_needed", 1) <= coaches)

def focus_ok(drill, focus):
    return focus == "balanced" or focus in drill.get("focus_tags", [])

def fill_time(pool, budget, used_ids):
    """Greedily fill a time budget from pool. Returns list of (drill, minutes)."""
    result = []
    remaining = budget
    random.shuffle(pool)
    for d in pool:
        if remaining <= 0:
            break
        if d["id"] in used_ids:
            continue
        preferred = (d["duration_min"] + d["duration_max"]) // 2
        assign = min(preferred, remaining)
        if assign < d["duration_min"]:
            if remaining >= d["duration_min"]:
                assign = d["duration_min"]
            else:
                continue
        result.append((d, assign))
        used_ids.add(d["id"])
        remaining -= assign
    # Extend last drill to absorb leftover
    if result and remaining > 0:
        d, m = result[-1]
        ext = min(d["duration_max"] - m, remaining)
        if ext > 0:
            result[-1] = (d, m + ext)
    return result


# ── Opening block ─────────────────────────────────────────────────────────────

def build_opening(drills, location, coaches, focus, budget, short=False):
    """
    Build opening arc: movement → baserunning → throwing.
    Returns list of {sub_phase, drill, minutes}.
    """
    opening_pool = [d for d in drills
                    if available(d, location, coaches)
                    and d.get("station_role") == "opening"]

    warmup_pool   = [d for d in opening_pool if d["id"] in _WARMUP_IDS]
    baserun_pool  = [d for d in opening_pool if d["id"] in _BASERUNNING_IDS]
    throwing_pool = [d for d in opening_pool if d["id"] in _THROWING_IDS]

    if short:  # 60-min: skip baserunning, split remaining between movement and throwing
        splits = {"movement": int(budget * 0.40), "baserunning": 0,
                  "throwing": budget - int(budget * 0.40)}
    else:
        mv = int(budget * 0.28)
        br = int(budget * 0.32)
        splits = {"movement": mv, "baserunning": br, "throwing": budget - mv - br}

    result = []
    used   = set()

    def fill_sub(pool, sub_label, sub_budget):
        if sub_budget <= 0 or not pool:
            return
        items = fill_time(pool, sub_budget, used)
        for d, m in items:
            result.append({"sub_phase": sub_label, "drill": d, "minutes": m})

    fill_sub(warmup_pool,   "Movement & Stretch",   splits["movement"])
    fill_sub(baserun_pool,  "Base Running",          splits["baserunning"])
    # Give throwing any leftover time from movement/baserunning
    used_minutes = sum(i["minutes"] for i in result)
    throwing_budget = budget - used_minutes - (0 if short else 0)
    fill_sub(throwing_pool, "Throwing Progression",  max(splits["throwing"], throwing_budget))
    return result


# ── Stations block ────────────────────────────────────────────────────────────

def build_stations(drills, location, coaches, focus, budget, player_count=12):
    """
    Build simultaneous station rotation.
    Returns dict with rotation plan and per-station details.
    """
    composition = list(STATION_COMPOSITIONS.get(focus, STATION_COMPOSITIONS["balanced"]))

    # Gym: replace pitching station with throwing if no mound available
    if location in ("gym", "overtime"):
        composition = [
            ("station_throwing" if r == "station_pitching" else r, l)
            for r, l in composition
        ]

    n_stations       = len(composition)
    rotation_minutes = max(8, budget // n_stations)
    coaches_left     = coaches - 1  # one coach floats / runs the clock

    stations = []
    used_ids = set()

    for role, label in composition:
        candidates = [
            d for d in drills
            if d.get("station_role") == role
            and location in d.get("locations", [])
            and d.get("station_safe", False)
            and d["id"] not in used_ids
            and d["duration_min"] <= rotation_minutes
        ]
        if not candidates:
            continue

        # Prefer focus-relevant drills
        focused = [d for d in candidates if focus_ok(d, focus)]
        pool = focused if focused else candidates
        random.shuffle(pool)
        chosen = pool[0]
        used_ids.add(chosen["id"])

        group_size    = chosen.get("group_size_ideal") or (player_count // n_stations)
        needs_coach   = not chosen.get("self_directed", False)
        coach_here    = needs_coach and coaches_left > 0
        if coach_here:
            coaches_left -= 1

        stations.append({
            "label":         label,
            "role":          role,
            "drill":         chosen,
            "group_size":    group_size,
            "minutes":       rotation_minutes,
            "coach_assigned": coach_here,
        })

    return {
        "rotation_minutes": rotation_minutes,
        "n_rotations":      len(stations),
        "total_minutes":    rotation_minutes * len(stations),
        "stations":         stations,
    }


# ── Team time block ───────────────────────────────────────────────────────────

def build_team_time(drills, location, coaches, focus, budget):
    """
    Select 1-2 whole-team activities. Situations focus leads instructive→game-like;
    all others lead game-like, optional instructive build-up if time allows.
    Falls back progressively when location or focus constrains the pool.
    """
    def get_candidates(loc, cch, foc):
        return [
            d for d in drills
            if d.get("station_role") == "team"
            and available(d, loc, cch)
            and focus_ok(d, foc)
        ]

    # Try progressively relaxed constraints until we have something
    candidates = get_candidates(location, coaches, focus)
    if not candidates:
        candidates = get_candidates(location, coaches, "balanced")
    if not candidates:
        # Last resort: ignore coach count, keep location
        candidates = [d for d in drills
                      if d.get("station_role") == "team"
                      and location in d.get("locations", [])]
    if not candidates:
        # Absolute last resort: any team drill
        candidates = [d for d in drills if d.get("station_role") == "team"]

    game_like   = [d for d in candidates if d["id"] in GAME_LIKE_TEAM_IDS]
    instructive = [d for d in candidates if d["id"] in INSTRUCTIVE_TEAM_IDS]
    random.shuffle(game_like)
    random.shuffle(instructive)

    if focus == "situations":
        ordered = instructive[:1] + game_like[:1]
    else:
        ordered = game_like[:1] + (instructive[:1] if budget >= 40 else [])

    # If neither list had anything, use whatever candidates we have
    if not ordered:
        ordered = candidates[:2]

    result    = []
    used_ids  = set()
    remaining = budget

    for d in ordered:
        if remaining <= 0 or d["id"] in used_ids:
            continue
        preferred = (d["duration_min"] + d["duration_max"]) // 2
        assign = min(preferred, remaining)
        if assign < d["duration_min"]:
            if remaining >= d["duration_min"]:
                assign = d["duration_min"]
            else:
                continue
        result.append({"drill": d, "minutes": assign})
        used_ids.add(d["id"])
        remaining -= assign

    # Absorb remaining time into the last activity
    if result and remaining > 0:
        last = result[-1]
        ext  = min(last["drill"]["duration_max"] - last["minutes"], remaining)
        if ext > 0:
            last["minutes"] += ext

    return result


# ── Plan assembly ─────────────────────────────────────────────────────────────

def build_practice_plan(duration, location, coaches, focus,
                        practice_date=None, player_count=12):
    drills  = load_drills()
    budgets = (sixty_min_phases(location, focus) if duration == 60
               else PHASE_BUDGETS[duration].copy())

    plan = {
        "date":         practice_date or date.today().strftime("%B %d, %Y"),
        "duration":     duration,
        "location":     LOCATIONS[location],
        "location_key": location,
        "coaches":      coaches,
        "focus":        FOCUS_OPTIONS[focus],
        "focus_key":    focus,
        "player_count": player_count,
        "phases":       [],
        "all_equipment": set(),
    }

    clock = 0

    def add_equipment(items_or_stations):
        for item in items_or_stations:
            d = item.get("drill") or item.get("drill")
            if d:
                for eq in d.get("equipment", []):
                    plan["all_equipment"].add(eq)

    # Opening
    opening_items   = build_opening(drills, location, coaches, focus,
                                    budgets["opening"], short=(duration == 60))
    opening_minutes = sum(i["minutes"] for i in opening_items)
    add_equipment(opening_items)
    plan["phases"].append({
        "key": "opening", "label": "Opening", "type": "opening",
        "minutes": opening_minutes, "start": clock, "items": opening_items,
    })
    clock += opening_minutes

    # Stations
    if budgets["stations"] > 0:
        sdata = build_stations(drills, location, coaches, focus,
                               budgets["stations"], player_count)
        for s in sdata["stations"]:
            for eq in s["drill"].get("equipment", []):
                plan["all_equipment"].add(eq)
        plan["phases"].append({
            "key": "stations", "label": "Stations", "type": "stations",
            "minutes": sdata["total_minutes"], "start": clock, "data": sdata,
        })
        clock += sdata["total_minutes"]

    # Team time
    if budgets["team"] > 0:
        team_items   = build_team_time(drills, location, coaches, focus, budgets["team"])
        team_minutes = sum(i["minutes"] for i in team_items)
        add_equipment(team_items)
        plan["phases"].append({
            "key": "team", "label": "Team Time", "type": "team",
            "minutes": team_minutes, "start": clock, "items": team_items,
        })
        clock += team_minutes

    # Closure
    closure = next((d for d in drills if d["id"] == "team_huddle_closure"), None)
    if closure:
        plan["phases"].append({
            "key": "closure", "label": "Closure", "type": "closure",
            "minutes": 5, "start": clock,
            "items": [{"sub_phase": "Closure", "drill": closure, "minutes": 5}],
        })
        clock += 5

    plan["total_minutes"] = clock
    plan["all_equipment"] = sorted(plan["all_equipment"])
    return plan


# ── Text output ───────────────────────────────────────────────────────────────

def print_plan(plan):
    W = 68
    print()
    print("=" * W)
    print("  LGLL PRACTICE PLAN")
    print("=" * W)
    print(f"  Date:      {plan['date']}")
    print(f"  Duration:  {plan['duration']} min  ·  {plan['coaches']} coaches  ·  ~{plan['player_count']} players")
    print(f"  Location:  {plan['location']}")
    print(f"  Focus:     {plan['focus']}")
    print("=" * W)

    for phase in plan["phases"]:
        t   = phase["start"]
        end = t + phase["minutes"]
        print()

        if phase["type"] == "opening":
            print(f"── OPENING  ({phase['minutes']} min · T+{t:02d}–{end:02d}) {'─'*25}")
            cur_sub = None
            for item in phase["items"]:
                if item["sub_phase"] != cur_sub:
                    cur_sub = item["sub_phase"]
                    print(f"\n   ▸ {cur_sub}")
                d = item["drill"]
                print(f"     [{item['minutes']} min]  {d['name']}")
                for cue in d.get("coaching_cues", [])[:2]:
                    print(f"                  • {cue}")

        elif phase["type"] == "stations":
            sd = phase["data"]
            print(f"── STATIONS  ({phase['minutes']} min · T+{t:02d}–{end:02d})  "
                  f"{sd['n_rotations']} stations × {sd['rotation_minutes']} min {'─'*8}")
            print(f"   Rotate on whistle every {sd['rotation_minutes']} minutes.\n")
            for i, s in enumerate(sd["stations"]):
                letter = "ABCDE"[i]
                coach_note = "coach present" if s["coach_assigned"] else "self-directed"
                print(f"   Station {letter} · {s['label']}  [{coach_note} · ~{s['group_size']} players]")
                d = s["drill"]
                print(f"   Drill: {d['name']}")
                desc = d.get("description", "").replace("\n", " ").strip()
                print(f"   {desc[:130]}...")
                for cue in d.get("coaching_cues", [])[:2]:
                    print(f"   • {cue}")
                print()

        elif phase["type"] == "team":
            print(f"── TEAM TIME  ({phase['minutes']} min · T+{t:02d}–{end:02d}) {'─'*23}")
            for item in phase["items"]:
                d   = item["drill"]
                tag = "[GAME-LIKE]" if d["id"] in GAME_LIKE_TEAM_IDS else "[INSTRUCTIVE]"
                print(f"\n   [{item['minutes']} min]  {d['name']}  {tag}")
                desc = d.get("description", "").replace("\n", " ").strip()
                print(f"   {desc[:130]}...")
                for cue in d.get("coaching_cues", [])[:2]:
                    print(f"   • {cue}")

        elif phase["type"] == "closure":
            print(f"── CLOSURE  (5 min · T+{t:02d}) {'─'*35}")
            print(f"   Team Huddle: 2-3 positives, 1 focus for next time, team cheer")

    print()
    print(f"── EQUIPMENT {'─'*52}")
    for eq in plan["all_equipment"]:
        print(f"   • {eq.replace('_',' ').title()}")
    print()
    print(f"   Total: {plan['total_minutes']} / {plan['duration']} min")
    print()


# ── CLI ───────────────────────────────────────────────────────────────────────

def prompt_choice(prompt, opts, default=None):
    print(f"\n{prompt}")
    keys = list(opts.keys())
    for i, k in enumerate(keys, 1):
        marker = " [default]" if k == default else ""
        print(f"  {i}. {opts[k]}{marker}")
    while True:
        raw = input("  Enter number: ").strip()
        if raw == "" and default:
            return default
        if raw.isdigit() and 1 <= int(raw) <= len(keys):
            return keys[int(raw) - 1]
        print("  Please enter a valid number.")

def prompt_int(prompt, options, default=None):
    print(f"\n{prompt} ({' / '.join(str(o) for o in options)})")
    while True:
        raw = input("  Enter value: ").strip()
        if raw == "" and default:
            return default
        if raw.isdigit() and int(raw) in options:
            return int(raw)
        print(f"  Please enter one of: {options}")

def run_interactive():
    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   LGLL Practice Plan Generator  v2           ║")
    print("║   La Grange Little League | Ages 7-9         ║")
    print("╚══════════════════════════════════════════════╝")
    duration     = prompt_int("Practice duration (minutes)?", [60, 90, 120], default=90)
    location     = prompt_choice("Practice location?", LOCATIONS, default="field")
    coaches      = prompt_int("Number of coaches available?", [2, 3, 4], default=3)
    focus        = prompt_choice("Practice focus?", FOCUS_OPTIONS, default="balanced")
    player_count = prompt_int("Approximate number of players?",
                              [8,9,10,11,12,13,14,15], default=12)
    fmt_opts     = {"both": "Both (.docx + .xlsx)", "docx": "Word doc only", "xlsx": "Spreadsheet only"}
    out_fmt      = prompt_choice("Output format?", fmt_opts, default="both")

    print("\nBuilding practice plan...")
    plan = build_practice_plan(duration, location, coaches, focus,
                               player_count=player_count)
    print_plan(plan)

    if out_fmt in ("both", "docx"):
        from output_docx import generate_docx
        path = generate_docx(plan)
        print(f"  ✓ Word doc:    {path}")
    if out_fmt in ("both", "xlsx"):
        from output_xlsx import generate_xlsx
        path = generate_xlsx(plan)
        print(f"  ✓ Spreadsheet: {path}")
    print()

def main():
    parser = argparse.ArgumentParser(description="LGLL Practice Plan Generator v2")
    parser.add_argument("--duration",  type=int, choices=[60,90,120])
    parser.add_argument("--location",  choices=list(LOCATIONS.keys()))
    parser.add_argument("--coaches",   type=int, choices=[2,3,4])
    parser.add_argument("--focus",     choices=list(FOCUS_OPTIONS.keys()))
    parser.add_argument("--players",   type=int, default=12)
    parser.add_argument("--format",    choices=["both","docx","xlsx"], default="both", dest="fmt")
    args = parser.parse_args()

    if not all([args.duration, args.location, args.coaches, args.focus]):
        run_interactive()
        return

    plan = build_practice_plan(args.duration, args.location, args.coaches,
                               args.focus, player_count=args.players)
    print_plan(plan)
    if args.fmt in ("both", "docx"):
        from output_docx import generate_docx
        print(f"Word doc: {generate_docx(plan)}")
    if args.fmt in ("both", "xlsx"):
        from output_xlsx import generate_xlsx
        print(f"Spreadsheet: {generate_xlsx(plan)}")

if __name__ == "__main__":
    main()
