"""领域模型模块

本模块包含基于 meta-doc/spec.schema.json 的领域模型定义和JSON Schema校验功能。
"""

from .spec import (
    ChangeHistory,
    CoreIdea,
    DecisionLog,
    DecisionStatus,
    DocumentStatus,
    EndToEndFlow,
    InteractionSessionModel,
    Meta,
    NonFunctionalNote,
    Prioritization,
    Priority,
    PriorityLevel,
    ProjectSpec,
    ReviewStatus,
    Role,
    Scenario,
    ScenarioStatus,
    Scope,
    Story,
)


__all__ = [
    "ProjectSpec",
    "CoreIdea",
    "Scope",
    "EndToEndFlow",
    "Scenario",
    "Story",
    "Priority",
    "Prioritization",
    "DecisionLog",
    "ChangeHistory",
    "NonFunctionalNote",
    "InteractionSessionModel",
    "Meta",
    "ScenarioStatus",
    "DocumentStatus",
    "DecisionStatus",
    "ReviewStatus",
    "PriorityLevel",
    "Role",
]
