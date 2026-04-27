export type Profile = {
  id: string;
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
