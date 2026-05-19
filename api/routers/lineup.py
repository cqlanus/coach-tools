"""
/lineup router — game day position rotation generator
Stub: implementation mirrors the logic from the game-day-lineup tool.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class LineupRequest(BaseModel):
    players: List[dict]       # [{name, number}]
    pitchers: List[str]       # player names ordered by inning
    catchers: List[str]       # player names ordered by inning
    innings: int = 6
    outfield_count: int = 3   # 3 or 4


@router.post("/generate")
def generate_lineup(req: LineupRequest):
    # TODO: port game-day-lineup logic here
    return {"status": "not_yet_implemented"}


@router.get("/options")
def get_options():
    return {
        "innings":        [4, 5, 6],
        "outfield_count": [3, 4],
    }
