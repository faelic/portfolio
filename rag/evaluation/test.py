"""Load the authored questions and their section-level evidence labels."""
from pathlib import Path
from typing import Literal, Self

from pydantic import BaseModel, Field, ValidationError, model_validator

TEST_FILE = Path(__file__).resolve().with_name("test.jsonl")
Category = Literal[
    "direct_fact", "temporal", "comparative", "numerical",
    "relationship", "spanning", "holistic",
]


class EvidenceAlternative(BaseModel):
    document_id: str = Field(min_length=1)
    section: str = Field(min_length=1)
    evidence_quote: str = Field(min_length=1)


class EvidenceGroup(BaseModel):
    alternatives: list[EvidenceAlternative] = Field(min_length=1)


class TestQuestion(BaseModel):
    id: str = Field(min_length=1)
    question: str = Field(min_length=1)
    keywords: list[str]
    reference_answer: str = Field(min_length=1)
    category: Category
    answerability: Literal["answerable", "partial", "unanswerable"]
    evidence_groups: list[EvidenceGroup]

    @model_validator(mode="after")
    def check_evidence_presence(self) -> Self:
        if bool(self.evidence_groups) != (self.answerability != "unanswerable"):
            raise ValueError("Only unanswerable questions must have no evidence groups")
        return self


def load_tests() -> list[TestQuestion]:
    tests = []
    seen_ids = set()
    with TEST_FILE.open(encoding="utf-8") as file:
        for line_number, line in enumerate(file, 1):
            try:
                test = TestQuestion.model_validate_json(line)
                if test.id in seen_ids:
                    raise ValueError(f"Duplicate test ID: {test.id}")
            except (ValidationError, ValueError) as exc:
                raise ValueError(f"{TEST_FILE}, line {line_number}: {exc}") from exc
            seen_ids.add(test.id)
            tests.append(test)
    return tests
