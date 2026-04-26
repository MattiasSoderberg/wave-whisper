export type Profile = {
  email: string;
  username: string;
  avatarUrl: string;
};

export type Conversation = {
  id: string;
  userA: Profile;
  userB: Profile;
  createdAt: string;
};
