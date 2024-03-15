import { useMutation } from "@apollo/client"
import {
  Button,
  Col,
  Grid,
  Group,
  Modal,
  Paper,
  Text,
  TextInput,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import { GraphQLErrorExtensions } from "graphql"
import React, { useState } from "react"
import { LoginUserMutation, RegisterUserMutation } from "../gql/graphql"
import { LOGIN_USER } from "../graphql/mutations/Login"
import { REGISTER_USER } from "../graphql/mutations/Register"
import { useGeneralStore } from "../stores/generalStore"
import { useUserStore } from "../stores/userStore"
function AuthOverlay() {
  const isLoginModalOpen = useGeneralStore((state) => state.isLoginModalOpen)
  const toggleLoginModal = useGeneralStore((state) => state.toggleLoginModal)
  const [isRegister, setIsRegister] = useState(true)
  const toggleForm = () => {
    setIsRegister(!isRegister)
  }

  const Register = () => {
    const form = useForm({
      initialValues: {
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validate: {
        fullname: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Username must be at least 3 characters",
        email: (value: string) =>
          value.includes("@") ? null : "Invalid email",
        password: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Password must be at least 3 characters",
        confirmPassword: (value: string, values) =>
          value.trim().length >= 3 && value === values.password
            ? null
            : "Passwords do not match",
      },
    })
    const setUser = useUserStore((state) => state.setUser)
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal)

    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({})

    const [registerUser, { loading }] =
      useMutation<RegisterUserMutation>(REGISTER_USER)

    const handleRegister = async () => {
      setErrors({})

      await registerUser({
        variables: {
          email: form.values.email,
          password: form.values.password,
          fullname: form.values.fullname,
          confirmPassword: form.values.confirmPassword,
        },
        onCompleted: (data) => {
          setErrors({})
          if (data?.register.user)
            setUser({
              id: data?.register.user.id,
              email: data?.register.user.email,
              fullname: data?.register.user.fullname,
            })
          setIsLoginOpen()
        },
      }).catch((err) => {
        console.log(err.graphQLErrors, "ERROR")
        setErrors(err.graphQLErrors[0].extensions)
        useGeneralStore.setState({ isLoginModalOpen: true })
      })
    }

    return (
      <Paper>
        <Text align="center" size="xl">
          Register
        </Text>

        <form
          onSubmit={form.onSubmit(() => {
            handleRegister()
          })}
        >
          <Grid mt={20}>
            <Col span={12} md={6}>
              <TextInput
                label="Nome"
                placeholder="Digite um nome"
                {...form.getInputProps("fullname")}
                error={form.errors.username || (errors?.username as string)}
              />
            </Col>

            <Col span={12} md={6}>
              <TextInput
                autoComplete="off"
                label="Email"
                placeholder="E-mail"
                {...form.getInputProps("email")}
                error={form.errors.email || (errors?.email as string)}
              />
            </Col>
            <Col span={12} md={6}>
              <TextInput
                autoComplete="off"
                label="Senha"
                type="password"
                placeholder="Enter your password"
                {...form.getInputProps("password")}
                error={form.errors.password || (errors?.password as string)}
              />
            </Col>
            <Col span={12} md={6}>
              <TextInput
                {...form.getInputProps("confirmPassword")}
                error={
                  form.errors.confirmPassword ||
                  (errors?.confirmPassword as string)
                }
                autoComplete="off"
                label="Confirme sua senha"
                type="password"
                placeholder="Confirme sua senha"
              />
            </Col>

            <Col span={12}>
              <Button variant="link" onClick={toggleForm} pl={0}>
                Já possui uma conta? Clique aqui!
              </Button>
            </Col>
          </Grid>

          <Group position="left" mt={20}>
            <Button
              variant="outline"
              color="blue"
              type="submit"
              disabled={loading}
            >
              Registrar
            </Button>
            <Button variant="outline" color="red">
              Cancelar
            </Button>
          </Group>
        </form>
      </Paper>
    )
  }

  const Login = () => {
    const [loginUser, { loading }] =
      useMutation<LoginUserMutation>(LOGIN_USER)
    const setUser = useUserStore((state) => state.setUser)
    const setIsLoginOpen = useGeneralStore((state) => state.toggleLoginModal)
    const [errors, setErrors] = React.useState<GraphQLErrorExtensions>({})
    const [invalidCredentials, setInvalidCredentials] = React.useState("")
    const form = useForm({
      initialValues: {
        email: "",
        password: "",
      },
      validate: {
        email: (value: string) =>
          value.includes("@") ? null : "Invalid email",
        password: (value: string) =>
          value.trim().length >= 3
            ? null
            : "Senha deve ter mais de 3 caracteres",
      },
    })

    const handleLogin = async () => {
      await loginUser({
        variables: {
          email: form.values.email,
          password: form.values.password,
        },
        onCompleted: (data) => {
          setErrors({})
          if (data?.login.user) {
            setUser({
              id: data?.login.user.id,
              email: data?.login.user.email,
              fullname: data?.login.user.fullname,
              avatarUrl: data?.login.user.avatarUrl,
            })
            setIsLoginOpen()
          }
        },
      }).catch((err) => {
        setErrors(err.graphQLErrors[0].extensions)
        if (err.graphQLErrors[0].extensions?.invalidCredentials)
          setInvalidCredentials(
            err.graphQLErrors[0].extensions.invalidCredentials
          )
        useGeneralStore.setState({ isLoginModalOpen: true })
      })
    }
    return (
      <Paper>
        <Text align="center" size="xl">
          Login
        </Text>
        <form
          onSubmit={form.onSubmit(() => {
            handleLogin()
          })}
        >
          <Grid style={{ marginTop: 20 }}>
            <Col span={12} md={6}>
              <TextInput
                autoComplete="off"
                label="Email"
                placeholder="E-mail"
                {...form.getInputProps("email")}
                error={form.errors.email || (errors?.email as string)}
              />
            </Col>
            <Col span={12} md={6}>
              <TextInput
                autoComplete="off"
                label="Senha"
                type="password"
                placeholder="Senha"
                {...form.getInputProps("password")}
                error={form.errors.password || (errors?.password as string)}
              />
            </Col>
            <Col span={12} md={6}>
              <Text color="red">{invalidCredentials}</Text>
            </Col>
            <Col span={12}>
              <Button pl={0} variant="link" onClick={toggleForm}>
                Ainda não tem conta? Registre aqui
              </Button>
            </Col>
          </Grid>
          <Group position="left" style={{ marginTop: 20 }}>
            <Button
              variant="outline"
              color="blue"
              type="submit"
              disabled={loading}
            >
              Login
            </Button>
            <Button variant="outline" color="red" onClick={toggleLoginModal}>
              Cancelar
            </Button>
          </Group>
        </form>
      </Paper>
    )
  }
  return (
    <Modal centered opened={isLoginModalOpen} onClose={toggleLoginModal}>
      {isRegister ? <Register /> : <Login />}
    </Modal>
  )
}
export default AuthOverlay
