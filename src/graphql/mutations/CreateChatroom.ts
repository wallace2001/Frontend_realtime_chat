import { gql } from "@apollo/client"

export const CREATE_CHATROOM = gql`
  mutation CreateChatroom($name: String!, $ownerId: Float!) {
    createChatroom(name: $name, ownerId: $ownerId) {
      name
      id
    }
  }
`
