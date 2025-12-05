from typing import List, Dict, Any
from pydantic import BaseModel


class MultiTurnExchange(BaseModel):
    turn: int
    user: str
    agent: str


class ModuleResult(BaseModel):
    module: str
    score: float
    passed: bool
    details: str
    raw_dialogue: List[MultiTurnExchange]


class FinalReport(BaseModel):
    overall_score: float
    results: List[ModuleResult]
    summary: str
    json_report: Dict[str, Any]
