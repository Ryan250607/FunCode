<template>
  <div class="login">
    <div class="absolute top-0 right-0 p-4">
    <LanguageToggle />
    </div>
    <el-form
      ref="loginRef"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <div>
        <div class="flex justify-center items-center">
          <span class="mr-3">
            <img src="@/assets/logo/logo.png" alt="logo" class="w-10 h-10" />
          </span>
          <span class="font-semibold text-xl">FunCode</span>
        </div>
        <div class="mt-2 mb-10 text-center">
        </div>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          size="large"
          auto-complete="off"
          :placeholder="t('Please_enter_your_username')"
        >
          <template #prefix>
            <!-- <svg-icon icon-class="user" class="el-input__icon input-icon"/> -->
            <!-- <font-awesome-icon icon="fa-regular fa-user" /> -->
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          size="large"
          auto-complete="off"
         :placeholder="t('Please_enter_your_password')"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><el-icon><Lock /></el-icon
          ></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          size="large"
          auto-complete="off"
          :placeholder="t('Please_enter_your_verification_code')"
          style="width: 63%"
          @keyup.enter="handleLogin"
        >
          <template #prefix
            ><svg-icon icon-class="validCode" class="el-input__icon input-icon"
          /></template>
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>
      <el-checkbox
        v-model="loginForm.rememberMe"
        style="margin: 0px 0px 25px 0px"
        >{{ t('remember_password') }}</el-checkbox
      >
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="large"
          type="primary"
          class="login-btn w-full bg-white text-primary-400 hover:bg-primary hover:text-white transition-all duration-300"
          style="width: 100%"
          @click.prevent="handleLogin"
        >
          <span v-if="!loading">{{ t("login") }}</span>
          <span v-else> {{ t("message_loading") }}</span>
        </el-button>
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2025 Ryan All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";
import useUserStore from "@/store/modules/user";
import { useRouter } from "vue-router";
import { FormInstance } from "element-plus";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const userStore = useUserStore();
const router = useRouter();
const loginForm = ref<any>({
  username: "admin",
  password: "admin123",
  rememberMe: false,
  code: "",
  uuid: "",
});
const loginRules = {
  username: [{ required: true, trigger: "blur",message: t('Please_enter_your_username') }],
  password: [{ required: true, trigger: "blur" ,message: t("Please_enter_your_password"),}],
  code: [{ required: true, trigger: "change" }],
};

const codeUrl = ref("");
const loading = ref(false);
// 验证码开关
const captchaEnabled = ref(true);
// 注册开关
const register = ref(false);
const redirect = ref(undefined);
const loginRef = ref<FormInstance>();

function handleLogin() {
  loginRef.value?.validate((valid) => {
    if (valid) {
      loading.value = true;
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set("username", loginForm.value.username, { expires: 30 });
        const enPwd = encrypt(loginForm.value.password);
        if (enPwd) {
          Cookies.set("password", enPwd, { expires: 30 });
        }
        if (loginForm.value.rememberMe) {
          Cookies.set("rememberMe", String(loginForm.value.rememberMe), {
            expires: 30,
          });
        }
      } else {
        // 否则移除
        Cookies.remove("username");
        Cookies.remove("password");
        Cookies.remove("rememberMe");
      }
      // 调用action的登录方法
      userStore
        .login(loginForm.value)
        .then(() => {
          router.push({ path: redirect.value || "/" });
        })
        .catch(() => {
          loading.value = false;
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode();
          }
        });
    }
  });
}

function getCode() {
  getCodeImg().then((res: any) => {
    captchaEnabled.value =
      res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      loginForm.value.uuid = res.uuid;
    }
  });
}

function getCookie() {
  const username = Cookies.get("username");
  const password = Cookies.get("password");
  const rememberMe = Cookies.get("rememberMe");
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password:
      password === undefined
        ? loginForm.value.password
        : decrypt(password) || "",
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
  };
}

getCode();
getCookie();
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
