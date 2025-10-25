import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from './Form';
import { useAuth } from '../helpers/useMockAuth';
import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from './Dialog';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from './Form';
import { Input } from './Input';
import styles from './MockOAuthButton.module.css';

// A simple SVG for Google icon
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
      fill="#4285F4"
    />
    <path
      d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.0918 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29H0.957275C0.347727 8.51727 0 10.0768 0 11.7273C0 13.3777 0.347727 14.9373 0.957275 16.1645L3.96409 13.8327V10.71Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
      fill="#EA4335"
    />
  </svg>
);

// A simple SVG for Facebook icon
const FacebookIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);

type Provider = 'google' | 'facebook';

interface MockOAuthButtonProps {
  provider: Provider;
}

const loginSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es requerido.' }),
  email: z.string().email({ message: 'Por favor, ingrese un email válido.' }),
});

export const MockOAuthButton: React.FC<MockOAuthButtonProps> = ({
  provider,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    schema: loginSchema,
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const providerConfig = {
    google: {
      icon: <GoogleIcon />,
      text: 'Continuar con Google',
      className: styles.googleButton,
    },
    facebook: {
      icon: <FacebookIcon />,
      text: 'Continuar con Facebook',
      className: styles.facebookButton,
    },
  };

  const config = providerConfig[provider];

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login(values.name, values.email, provider);
    setIsOpen(false);
    navigate('/store');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className={`${styles.oauthButton} ${config.className}`}
        >
          {config.icon}
          {config.text}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulación de Ingreso</DialogTitle>
          <DialogDescription>
            Esto es una demostración. Ingresa cualquier nombre y email para
            simular el inicio de sesión con {provider}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={styles.form}
            id={`login-form-${provider}`}
          >
            <FormItem name="name">
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tu nombre"
                  value={form.values.name}
                  onChange={(e) =>
                    form.setValues((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem name="email">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.values.email}
                  onChange={(e) =>
                    form.setValues((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form={`login-form-${provider}`}
            size="lg"
            className={styles.submitButton}
          >
            Iniciar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};