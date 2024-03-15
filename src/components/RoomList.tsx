
import { useQuery } from "@apollo/client"
import {
  Button,
  Card,
  Flex,
  Group,
  Loader,
  ScrollArea,
  Text,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconPlus } from "@tabler/icons-react"
import { GetChatroomsForUserQuery } from "../gql/graphql"
import { GET_CHATROOMS_FOR_USER } from "../graphql/queries/GetChatroomsForUser"
import { useGeneralStore } from "../stores/generalStore"
import { useUserStore } from "../stores/userStore"
import CardRoom from "./CardRoom"
function RoomList() {
  const toggleCreateRoomModal = useGeneralStore(
    (state) => state.toggleCreateRoomModal
  )
  const userId = useUserStore((state) => state.id)

  const { data, loading } = useQuery<GetChatroomsForUserQuery>(
    GET_CHATROOMS_FOR_USER,
    {
      variables: {
        userId: userId,
      },
    }
  )

  const isMediumDevice = useMediaQuery("(max-width: 992px)")
  return (
    <Flex direction={"row"} h={"100vh"} ml={"100px"}>
      <Card shadow="md" p={0}>
        <Flex direction="column" align="start">
          <Group position="apart" w={"100%"} mb={"md"} mt={"md"} ml={"md"}>
            <Button
              onClick={toggleCreateRoomModal}
              variant="light"
              leftIcon={<IconPlus />}
            >
              Criar Sala
            </Button>
          </Group>
          <ScrollArea
            h={"83vh"}
            w={isMediumDevice ? "calc(100vw - 100px)" : "450px"}
          >
            <Flex direction={"column"}>
              <Flex justify="center" align="center" h="100%" mih={"75px"}>
                {loading && (
                  <Flex align="center">
                    <Loader mr={"md"} />
                    <Text c="dimmed" italic>
                      Carregando...
                    </Text>
                  </Flex>
                )}
              </Flex>
              {data?.getChatroomsForUser.map((chatroom) => 
                <CardRoom chatroom={chatroom} key={chatroom.id} />
              )}
            </Flex>
          </ScrollArea>
        </Flex>
      </Card>
    </Flex>
  )
}

export default RoomList
