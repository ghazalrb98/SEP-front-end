export type UserDto = {
  id: string;
  email: string;
  name: string;
  role: number;
};

export type RequestDto = {
  id: string;
  title: string;
  description: string;
  status: number;
  submittedAt: string;
  budgetEstimate: number;
  approvedBudget: number;
};

export type ReviewDto = {
  id: string;
  eventId: string;
  event: RequestDto;
  comments: string;
  submittedAt: string;
};
