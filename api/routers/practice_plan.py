"""
/practice-plan router
POST /practice-plan/generate  → returns a download URL for .docx and .xlsx
GET  /practice-plan/download/{filename}  → serves generated file
"""

import sys
import uuid
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Literal, List, Optional

# Add the practice-plan-generator tool to the path
TOOL_DIR = Path(__file__).parent.parent.parent / "tools" / "practice-plan-generator"
sys.path.insert(0, str(TOOL_DIR))

OUTPUT_DIR = Path(__file__).parent.parent / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

router = APIRouter()


class PracticePlanRequest(BaseModel):
    duration: Literal[60, 90, 120]
    location: Literal["field", "overtime", "gym"]
    coaches: Literal[2, 3, 4]
    focus: Literal[
        "balanced", "throwing", "hitting", "fielding",
        "baserunning", "situations", "pitching", "catching"
    ]
    player_count: int = 12
    format: Literal["both", "docx", "xlsx"] = "both"
    pinned_drill_ids: List[str] = []


class PracticePlanResponse(BaseModel):
    docx_url: Optional[str] = None
    xlsx_url: Optional[str] = None
    summary: dict


@router.post("/generate", response_model=PracticePlanResponse)
def generate_practice_plan(req: PracticePlanRequest):
    try:
        from generator import build_practice_plan
        from output_docx import generate_docx
        from output_xlsx import generate_xlsx

        # Point output to api/outputs
        import output_docx
        import output_xlsx
        output_docx.OUTPUT_DIR = OUTPUT_DIR
        output_xlsx.OUTPUT_DIR = OUTPUT_DIR

        plan = build_practice_plan(
            duration=req.duration,
            location=req.location,
            coaches=req.coaches,
            focus=req.focus,
            player_count=req.player_count,
            pinned_drill_ids=req.pinned_drill_ids,
        )

        docx_url = None
        xlsx_url = None

        if req.format in ("both", "docx"):
            path = generate_docx(plan)
            docx_url = f"/api/practice-plan/download/{Path(path).name}"

        if req.format in ("both", "xlsx"):
            path = generate_xlsx(plan)
            xlsx_url = f"/api/practice-plan/download/{Path(path).name}"

        # Build a JSON-serialisable summary
        summary = {
            "date":          plan["date"],
            "duration":      plan["duration"],
            "location":      plan["location"],
            "focus":         plan["focus"],
            "total_minutes": plan["total_minutes"],
            "phases": [
                {
                    "key":     p["key"],
                    "label":   p["label"],
                    "minutes": p["minutes"],
                }
                for p in plan["phases"]
            ],
            "equipment":      plan["all_equipment"],
            "pinned_placed":  plan.get("pinned_placed", []),
            "pinned_total":   len(req.pinned_drill_ids),
        }

        return PracticePlanResponse(
            docx_url=docx_url,
            xlsx_url=xlsx_url,
            summary=summary,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
def download_file(filename: str):
    path = OUTPUT_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path=str(path),
        filename=filename,
        media_type="application/octet-stream",
    )


@router.get("/drills")
def get_drills():
    """Return the full drill library for the browse UI."""
    try:
        from generator import load_drills
        return {"drills": load_drills()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/options")
def get_options():
    """Return the valid option values for the form."""
    return {
        "durations":  [60, 90, 120],
        "locations":  {
            "field":    "On the Field (outdoor, full diamond)",
            "overtime": "Overtime Sports (turf cages, limited space)",
            "gym":      "LTHS Gym (indoor, no live balls)",
        },
        "coaches":    [2, 3, 4],
        "focuses":    {
            "balanced":    "Balanced (all skill areas)",
            "throwing":    "Throwing & Arm",
            "hitting":     "Hitting",
            "fielding":    "Fielding",
            "baserunning": "Base Running",
            "situations":  "Situations & Team Concept",
            "pitching":    "Pitching",
            "catching":    "Catching",
        },
    }
