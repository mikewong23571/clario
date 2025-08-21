"""项目规格数据模型

基于 meta-doc/spec.schema.json 定义的 Pydantic 模型，提供类型安全和数据验证。
"""

from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator


# 枚举类型定义
class ScenarioStatus(str, Enum):
    """场景状态"""
    DRAFT = "Draft"
    IN_REVIEW = "InReview"
    APPROVED = "Approved"
    IMPLEMENTED = "Implemented"
    DEPRECATED = "Deprecated"


class DocumentStatus(str, Enum):
    """文档状态"""
    DRAFT = "Draft"
    IN_REVIEW = "InReview"
    ACTIVE = "Active"
    ARCHIVED = "Archived"


class DecisionStatus(str, Enum):
    """决策状态"""
    PROPOSED = "Proposed"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class ReviewStatus(str, Enum):
    """评审状态"""
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED_WITH_COMMENTS = "RejectedWithComments"


class PriorityLevel(str, Enum):
    """优先级级别"""
    MVP = "MVP"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Role(str, Enum):
    """角色类型"""
    SCOPE_PLANNER = "Scope Planner"
    REVIEWER = "Reviewer"
    RECORDER = "Recorder"
    PROMOTER = "Promoter"


class EstimatedComplexity(str, Enum):
    """预估复杂度"""
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class DecisionType(str, Enum):
    """决策类型"""
    FEATURE = "Feature"
    SCOPE = "Scope"
    TECHNICAL = "Technical"
    PROCESS = "Process"


# 基础数据模型
class CoreIdea(BaseModel):
    """核心理念"""
    problem_statement: str = Field(..., min_length=1, alias="problemStatement")
    target_audience: str = Field(..., min_length=1, alias="targetAudience")
    core_value: str = Field(..., min_length=1, alias="coreValue")

    model_config = ConfigDict(populate_by_name=True)


class Scope(BaseModel):
    """项目范围"""
    in_scope: List[str] = Field(default_factory=list, alias="inScope")
    out_of_scope: List[str] = Field(default_factory=list, alias="outOfScope")

    model_config = ConfigDict(populate_by_name=True)


class EndToEndFlow(BaseModel):
    """端到端流程"""
    title: Optional[str] = None
    description: Optional[str] = None
    steps: List[str] = Field(..., min_length=1)


class Story(BaseModel):
    """用户故事"""
    user_type: str = Field(..., min_length=1, alias="userType")
    action: str = Field(..., min_length=1)
    benefit: str = Field(..., min_length=1)

    model_config = ConfigDict(populate_by_name=True)


class Priority(BaseModel):
    """优先级"""
    level: PriorityLevel
    justification: Optional[str] = None


class Scenario(BaseModel):
    """场景定义"""
    id: Optional[str] = Field(None, pattern=r"^scn-[a-z0-9-]+$")
    name: str = Field(..., min_length=1)
    story: Story
    required_functions: List[str] = Field(..., alias="requiredFunctions")
    acceptance_criteria: List[str] = Field(default_factory=list, alias="acceptanceCriteria")
    priority: Optional[Priority] = None
    status: Optional[ScenarioStatus] = None
    dependencies: List[str] = Field(default_factory=list)
    estimated_complexity: Optional[EstimatedComplexity] = Field(None, alias="estimatedComplexity")

    @field_validator('dependencies')
    @classmethod
    def validate_dependencies(cls, v: List[str]) -> List[str]:
        """验证依赖场景ID格式"""
        for dep in v:
            if not dep.startswith('scn-'):
                raise ValueError(f"依赖场景ID必须以'scn-'开头: {dep}")
        return v

    model_config = ConfigDict(populate_by_name=True)


class Prioritization(BaseModel):
    """优先级分组"""
    mvp: List[str] = Field(default_factory=list, alias="MVP")
    later: List[str] = Field(default_factory=list, alias="Later")
    maybe: List[str] = Field(default_factory=list, alias="Maybe")
    system: List[str] = Field(default_factory=list, alias="System")

    @field_validator('mvp', 'later', 'maybe')
    @classmethod
    def validate_scenario_or_function_ids(cls, v: List[str]) -> List[str]:
        """验证场景或功能ID格式"""
        for item in v:
            if not (item.startswith('scn-') or item.startswith('fn-')):
                raise ValueError(f"ID必须以'scn-'或'fn-'开头: {item}")
        return v

    @field_validator('system')
    @classmethod
    def validate_system_ids(cls, v: List[str]) -> List[str]:
        """验证系统ID格式"""
        for item in v:
            if not item.startswith('sys-'):
                raise ValueError(f"系统ID必须以'sys-'开头: {item}")
        return v

    model_config = ConfigDict(populate_by_name=True)


class DecisionImpact(BaseModel):
    """决策影响"""
    scope: Optional[List[str]] = None
    scenarios: Optional[List[str]] = None

    @field_validator('scenarios')
    @classmethod
    def validate_scenario_ids(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """验证场景ID格式"""
        if v:
            for scenario_id in v:
                if not scenario_id.startswith('scn-'):
                    raise ValueError(f"场景ID必须以'scn-'开头: {scenario_id}")
        return v


class DecisionLog(BaseModel):
    """决策日志"""
    date: date
    decision: str = Field(..., min_length=1)
    reason: Optional[str] = None
    rejected_options: List[str] = Field(default_factory=list, alias="rejectedOptions")
    status: Optional[DecisionStatus] = None
    impact: Optional[DecisionImpact] = None
    decision_type: Optional[DecisionType] = Field(None, alias="decisionType")

    model_config = ConfigDict(populate_by_name=True)


class ChangeHistory(BaseModel):
    """变更历史"""
    date: date
    description: str = Field(..., min_length=1)
    related: Optional[List[str]] = None

    @field_serializer('date')
    def serialize_date(self, value: date) -> str:
        """序列化日期为 ISO 格式字符串"""
        return value.isoformat()


class NonFunctionalTarget(BaseModel):
    """非功能性目标"""
    mode: str = Field(..., min_length=1)
    constraints: List[str] = Field(..., min_length=1)


class NonFunctionalNote(BaseModel):
    """非功能性说明"""
    category: str = Field(..., min_length=1)
    note: str = Field(..., min_length=1)
    targets: Optional[List[NonFunctionalTarget]] = None


class PersistenceOption(BaseModel):
    """持久化选项"""
    id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None


class Persistence(BaseModel):
    """持久化配置"""
    description: Optional[str] = None
    options: Optional[List[PersistenceOption]] = None


class InteractionSessionModel(BaseModel):
    """交互会话模型"""
    id: str = Field(..., pattern=r"^[A-Z][0-9A-Z]*$")
    name: str
    description: Optional[str] = None
    core_concept: str = Field(..., alias="coreConcept")
    multi_doc_handling: str = Field(..., alias="multiDocHandling")
    persistence: Persistence

    model_config = ConfigDict(populate_by_name=True)


class InteractionSessionModels(BaseModel):
    """交互会话模型集合"""
    title: Optional[str] = None
    models: List[InteractionSessionModel] = Field(..., min_length=1)


class ReviewHistory(BaseModel):
    """评审历史"""
    date: date
    reviewer: Role
    status: ReviewStatus
    comments: Optional[str] = None


class Meta(BaseModel):
    """元数据"""
    generated_by: List[Role] = Field(default_factory=list, alias="generatedBy")
    conversation_links: List[str] = Field(default_factory=list, alias="conversationLinks")
    document_status: Optional[DocumentStatus] = Field(None, alias="documentStatus")
    tags: List[str] = Field(default_factory=list)
    review_history: List[ReviewHistory] = Field(default_factory=list, alias="reviewHistory")

    model_config = ConfigDict(populate_by_name=True)


class ProjectSpec(BaseModel):
    """项目规格文档

    基于 meta-doc/spec.schema.json 的完整项目规格定义。
    """
    last_updated: date = Field(..., alias="lastUpdated")
    spec_version: str = Field(..., pattern=r"^\d+\.\d+(\.\d+)?$", alias="specVersion")
    core_idea: CoreIdea = Field(..., alias="coreIdea")
    scope: Scope
    end_to_end_flow: Optional[EndToEndFlow] = Field(None, alias="endToEndFlow")
    scenarios: List[Scenario] = Field(default_factory=list)
    prioritization: Optional[Prioritization] = None
    decision_log: List[DecisionLog] = Field(default_factory=list, alias="decisionLog")
    change_history: List[ChangeHistory] = Field(default_factory=list, alias="changeHistory")
    non_functional_notes: List[NonFunctionalNote] = Field(
        default_factory=list, alias="nonFunctionalNotes"
    )
    interaction_session_models: Optional[InteractionSessionModels] = Field(
        None, alias="interactionSessionModels"
    )
    meta: Optional[Meta] = None

    model_config = ConfigDict(populate_by_name=True)

    @field_serializer('last_updated')
    def serialize_last_updated(self, value: date) -> str:
        """序列化日期为 ISO 格式字符串"""
        return value.isoformat()

    @field_validator('spec_version')
    @classmethod
    def validate_spec_version(cls, v: str) -> str:
        """验证规格版本号格式"""
        import re
        if not re.match(r'^\d+\.\d+(\.\d+)?$', v):
            raise ValueError('规格版本号格式必须为 x.y 或 x.y.z')
        return v
