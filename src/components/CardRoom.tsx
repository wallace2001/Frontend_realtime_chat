import { useMutation, useSubscription } from "@apollo/client";
import { Button, Card, Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Chatroom, NewMessageSubscription } from "../gql/graphql";
import { DELETE_CHATROOM } from "../graphql/mutations/DeleteChatroom";
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser";
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions/NewMessage";
import { useUserStore } from "../stores/userStore";
import OverlappingAvatars from "./OverlappingAvatars";

interface ICardRoom {
    chatroom: Chatroom;
}

function CardRoom({
    chatroom
}: ICardRoom) {

    const userId = useUserStore((state) => state.id)

    const isSmallDevice = useMediaQuery("(max-width: 768px)")

    const defaultTextStyles: React.CSSProperties = {
        textOverflow: isSmallDevice ? "unset" : "ellipsis",
        whiteSpace: isSmallDevice ? "unset" : "nowrap",
        overflow: isSmallDevice ? "unset" : "hidden",
    }

    const { data: dataSub } = useSubscription<NewMessageSubscription>(
        NEW_MESSAGE_SUBSCRIPTION,
        {
            variables: { chatroomId: parseInt(chatroom.id!) },
        }
    )

    const [activeRoomId, setActiveRoomId] = React.useState<number | null>(
        parseInt(useParams<{ id: string }>().id || "0")
    )
    const navigate = useNavigate()

    const [deleteChatroom] = useMutation(DELETE_CHATROOM, {
        variables: {
            chatroomId: activeRoomId,
        },
        refetchQueries: [
            {
                query: GET_CHATROOMS_FOR_USER,
                variables: {
                    userId: userId,
                },
            },
        ],
        onCompleted: () => {
            navigate("/")
        },
    })

    return (
        <Link
            style={{
                transition: "background-color 0.3s",
                cursor: "pointer",
            }}
            to={`/chatrooms/${chatroom.id}`}
            key={chatroom.id}
            onClick={() => setActiveRoomId(parseInt(chatroom.id || "0"))}
        >
            <Card
                style={
                    activeRoomId === parseInt(chatroom.id || "0")
                        ? { backgroundColor: "#f0f1f1" }
                        : undefined
                }
                mih={120}
                py={"md"}
                withBorder
                shadow="md"
            >
                <Flex justify={"space-around"}>
                    {chatroom.users && (
                        <Flex align={"center"}>
                            <OverlappingAvatars users={chatroom.users} />
                        </Flex>
                    )}
                    <Flex direction={"column"}>
                        <Text size="lg" style={defaultTextStyles}>
                            {chatroom.name}
                        </Text>
                        {chatroom.messages && chatroom.messages.length > 0 ? (
                            <>
                                <Text style={defaultTextStyles}>
                                    {dataSub?.newMessage?.content || chatroom.messages[0].content}
                                </Text>
                                <Text c="dimmed" style={defaultTextStyles}>
                                    {new Date(
                                        dataSub?.newMessage?.createdAt || chatroom.messages[0].createdAt
                                    ).toLocaleString()}
                                </Text>
                            </>
                        ) : (
                            <Text italic c="dimmed" style={defaultTextStyles}>
                                Sem mensagem
                            </Text>
                        )}
                    </Flex>
                    {chatroom.owner === userId && (
                        <Flex h="100%" align="end" justify={"end"}>
                            <Button
                                p={0}
                                variant="light"
                                color="red"
                                onClick={(e) => {
                                    e.preventDefault()
                                    deleteChatroom()
                                }}
                            >
                                <IconX />
                            </Button>
                        </Flex>
                    )}
                </Flex>
            </Card>
        </Link>
    );
}

export default CardRoom;