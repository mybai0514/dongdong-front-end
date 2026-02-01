/**
 * 类型定义统一导出
 */

// 用户相关类型
export type {
  User,
  LoginFormData,
  RegisterFormData,
  UserProfileUpdate,
} from './user'

// 队伍相关类型
export type {
  Team,
  TeamStatus,
  ContactMethod,
  CreateTeamFormData,
  TeamMember,
  MembershipStatus,
  PaginatedTeamsResponse,
  Feedback,
  FeedbackMood,
  CreateFeedbackFormData,
} from './team'

// 论坛相关类型
export type {
  ForumCategory,
  ForumPost,
  PostStatus,
  PaginatedPostsResponse,
  CreatePostFormData,
  ForumComment,
  CommentStatus,
  CreateCommentFormData,
  LikeResponse,
} from './forum'

// API 响应类型
export type {
  ApiResponse,
  AuthResponse,
  LoginResponse,
  RegisterResponse,
  MeResponse,
  CreateTeamResponse,
  JoinTeamResponse,
  TeamsListResponse,
  TeamDetailResponse,
  TeamMembersResponse,
  CheckMembershipResponse,
  FeedbackListResponse,
  CreateFeedbackResponse,
  SuccessResponse,
  ErrorResponse,
} from './api'
