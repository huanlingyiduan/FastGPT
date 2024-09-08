import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Box, Input, Button, useDisclosure } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { LoginPageTypeEnum } from '@/web/support/user/login/constants';
import { postFindPassword } from '@/web/support/user/api';
import { useSendCode } from '@/web/support/user/hooks/useSendCode';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { useToast } from '@fastgpt/web/hooks/useToast';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useTranslation } from 'next-i18next';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';

interface Props {
  setPageType: Dispatch<`${LoginPageTypeEnum}`>;
  loginSuccess: (e: ResLogin) => void;
}

interface RegisterType {
  username: string;
  code: string;
  password: string;
  password2: string;
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { feConfigs } = useSystemStore();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors }
  } = useForm<RegisterType>({
    mode: 'onBlur'
  });
  const username = watch('username');

  const { SendCodeBox } = useSendCode({ type: 'findPassword' });

  const placeholder = feConfigs?.find_password_method
    ?.map((item) => {
      switch (item) {
        case 'email':
          return t('common:support.user.login.Email');
        case 'phone':
          return t('common:support.user.login.Phone number');
        default:
          return t('common:support.user.login.Username');
      }
    })
    .join('/');

  const { runAsync: onclickFindPassword, loading: requesting } = useRequest2(
    async ({ username, password }: RegisterType) => {
      await postFindPassword({
        username,
        password
      }).then(() => {
        toast({
          status: 'success',
          title: t('user:password.retrieved')
        });
      });
    },
    {
      refreshDeps: [loginSuccess, t, toast]
    }
  );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        {t('user:password.retrieved_account', { account: feConfigs?.systemTitle })}
      </Box>
      <Box
        mt={'42px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onclickFindPassword)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder="用户名"
            {...register('username', {
              required: t('user:password.email_phone_void')
              // pattern: {
              //   value:
              //     /(^1[3456789]\d{9}$)|(^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$)/,
              //   message: t('user:password.email_phone_error')
              // }
            })}
          ></Input>
        </FormControl>
        {/* <FormControl
          mt={6}
          isInvalid={!!errors.code}
          display={'flex'}
          alignItems={'center'}
          position={'relative'}
        >
          <Input
            bg={'myGray.50'}
            flex={1}
            maxLength={8}
            placeholder={t('user:password.verification_code')}
            {...register('code', {
              required: t('user:password.code_required')
            })}
          ></Input>
          <SendCodeBox username={username} />
        </FormControl> */}
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="新密码(4~20位)"
            {...register('password', {
              required: '密码不能为空',
              minLength: {
                value: 4,
                message: '密码最少 4 位最多 20 位'
              },
              maxLength: {
                value: 20,
                message: '密码最少 4 位最多 20 位'
              }
            })}
          ></Input>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password2}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="确认密码"
            {...register('password2', {
              validate: (val) => (getValues('password') === val ? true : '两次密码不一致')
            })}
          ></Input>
        </FormControl>

        <Button
          type="submit"
          mt={10}
          w={'100%'}
          size={['md', 'md']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickFindPassword)}
        >
          重置密码
        </Button>
        <Box
          float={'right'}
          fontSize="sm"
          mt={2}
          mb={'50px'}
          color={'primary.700'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => setPageType(LoginPageTypeEnum.passwordLogin)}
        >
          {t('user:password.to_login')}
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;
