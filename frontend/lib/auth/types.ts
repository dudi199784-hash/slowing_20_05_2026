export type MemberRole = "USER" | "ADMIN";

export type MemberSession = {
  id: number;
  userId: string;
  /** 백엔드 회원 이름(로그인 아이디와 다름) */
  username?: string;
  role?: MemberRole;
};
