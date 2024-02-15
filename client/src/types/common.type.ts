export type ConversationPayload = {
  sender_id: string
  receiver_id: string
  content: string
}

export type ConversationPagination = {
  page: number
  total_pages: number
}
