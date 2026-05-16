export interface IConversationListItem {
  Id:        string;
  Title:     string | null;
  UpdatedAt: string;
}

export interface IConversationMessage {
  Role:    'user' | 'assistant';
  Content: string;
}

export interface IConversationDetail {
  Id:       string;
  Title:    string | null;
  Source:   string;
  Messages: IConversationMessage[];
}

export interface IMascotConversation {
  ConversationId: string;
  Messages:       IConversationMessage[];
}
