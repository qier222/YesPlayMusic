<template>
  <div v-show="show" class="cookie-import-modal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Cookie 导入</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      <div class="modal-body">
        <div class="input-section">
          <label for="musicU">MUSIC_U Cookie:</label>
          <textarea
            id="musicU"
            v-model="musicU"
            placeholder="请输入你的 MUSIC_U Cookie 值"
            rows="4"
          ></textarea>
        </div>
        <div class="notice">
          <p>💡 如何获取 MUSIC_U Cookie：</p>
          <ol>
            <li>在浏览器中登录网易云音乐官网</li>
            <li>按 F12 打开开发者工具</li>
            <li>切换到 Application/存储 标签</li>
            <li>在左侧找到 Cookies → music.163.com</li>
            <li>复制 MUSIC_U 的值</li>
          </ol>
        </div>
        <div v-if="status.message" class="status-message" :class="status.type">
          {{ status.message }}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">取消</button>
        <button
          class="btn-confirm"
          :disabled="!musicU || processing"
          @click="handleImport"
        >
          <span v-if="!processing">导入登录</span>
          <span v-else class="loading">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CookieImportModal',
  data() {
    return {
      show: false,
      musicU: '',
      processing: false,
      status: {
        type: '',
        message: '',
      },
    };
  },
  methods: {
    openModal() {
      this.show = true;
      this.musicU = '';
      this.processing = false;
      this.status = { type: '', message: '' };
      // 禁用滚动
      this.$store.commit('enableScrolling', false);
    },
    closeModal() {
      this.show = false;
      // 启用滚动
      this.$store.commit('enableScrolling', true);
    },
    async handleImport() {
      // 严格按照 quick-login-command 的逻辑实现
      console.log(
        '%c🎵 YesPlayMusic 登录助手',
        'color: #335eea; font-size: 20px; font-weight: bold;'
      );
      console.log('%c开始登录流程...', 'color: #42b883; font-size: 14px;');

      if (!this.musicU || this.musicU.length < 50) {
        console.error(
          '%c❌ 错误: MUSIC_U Cookie 无效或未设置',
          'color: red; font-size: 14px;'
        );
        console.log(
          '%c💡 请将脚本中的 MUSIC_U 替换为你自己的 Cookie',
          'color: orange;'
        );
        this.status = {
          type: 'error',
          message: '❌ MUSIC_U Cookie 无效或过短',
        };
        return;
      }

      this.processing = true;
      this.status = { type: 'info', message: '📝 正在保存 Cookie...' };

      try {
        // 1. 清除旧的登录状态和 Cookie
        console.log('🧹 [1/4] 清除旧的登录状态...');
        this.status = { type: 'info', message: '🧹 正在清除旧的登录状态...' };

        // 清除所有旧的 Cookie
        localStorage.removeItem('MUSIC_U');
        localStorage.removeItem('cookie-MUSIC_U');
        localStorage.removeItem('__csrf');
        localStorage.removeItem('cookie-__csrf');

        // 清除旧的用户数据
        localStorage.removeItem('data');

        console.log('✅ 旧的登录状态已清除');

        // 2. 保存新的 Cookie
        console.log('📝 [2/4] 保存新的 Cookie...');
        this.status = { type: 'info', message: '📝 正在保存 Cookie...' };

        localStorage.setItem('MUSIC_U', this.musicU);
        localStorage.setItem('cookie-MUSIC_U', this.musicU);
        console.log('✅ Cookie 已保存到 localStorage');

        // 3. 测试 API
        console.log('🌐 [3/4] 验证登录状态...');
        this.status = { type: 'info', message: '🌐 正在验证登录状态...' };

        // 获取 API 基础路径
        let baseURL = '';
        if (process.env.IS_ELECTRON) {
          if (process.env.NODE_ENV === 'production') {
            baseURL = process.env.VUE_APP_ELECTRON_API_URL || '';
          } else {
            baseURL = process.env.VUE_APP_ELECTRON_API_URL_DEV || '';
          }
        } else {
          baseURL = process.env.VUE_APP_NETEASE_API_URL || '';
        }

        // 构建 API URL，在 Electron 环境下需要通过参数传递 Cookie
        let apiUrl = `${baseURL}/user/account?timestamp=${Date.now()}`;
        if (process.env.IS_ELECTRON && baseURL) {
          apiUrl += `&cookie=MUSIC_U=${encodeURIComponent(this.musicU)}`;
        }
        console.log('   请求地址:', apiUrl);

        const response = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('   响应数据:', data);

        if (data.code === 200 && data.profile) {
          console.log(
            '%c✅ 登录成功!',
            'color: green; font-size: 16px; font-weight: bold;'
          );
          console.log(
            `%c👤 欢迎: ${data.profile.nickname}`,
            'color: #335eea; font-size: 14px;'
          );
          console.log(`   用户ID: ${data.account.id}`);
          console.log(`   VIP类型: ${data.account.vipType}`);

          // 4. 保存用户信息
          console.log('💾 [4/4] 保存用户信息...');
          this.status = { type: 'info', message: '💾 正在保存用户信息...' };

          const oldData = JSON.parse(localStorage.getItem('data') || '{}');
          const newData = {
            ...oldData,
            user: data.profile,
            account: data.account,
            loginMode: 'account',
            loginTime: Date.now(),
          };
          localStorage.setItem('data', JSON.stringify(newData));
          console.log('✅ 用户信息已保存');

          this.status = {
            type: 'success',
            message: `✅ 登录成功！欢迎 ${data.profile.nickname}`,
          };

          // 刷新页面
          console.log(
            '%c🔄 3秒后自动刷新页面...',
            'color: #42b883; font-size: 14px;'
          );
          setTimeout(() => {
            location.reload();
          }, 3000);
        } else if (data.code === 200 && !data.profile) {
          console.error(
            '%c❌ 登录失败: 账号信息为空（匿名用户）',
            'color: red; font-size: 14px;'
          );
          console.log('%c💡 可能的原因:', 'color: orange;');
          console.log('   1. Cookie 已过期');
          console.log('   2. Cookie 格式不正确');
          console.log('   3. Cookie 被网易云服务器拒绝');
          console.log('%c💡 解决方案: 重新获取 Cookie', 'color: orange;');

          this.status = {
            type: 'error',
            message: '❌ 登录失败: Cookie 无效或已过期',
          };
          this.processing = false;
        } else {
          console.error('%c❌ 登录失败:', 'color: red; font-size: 14px;');
          console.log('   错误代码:', data.code);
          console.log('   错误信息:', data.message || data.msg || '未知错误');

          this.status = {
            type: 'error',
            message: `❌ 登录失败: ${data.message || data.msg || '未知错误'}`,
          };
          this.processing = false;
        }
      } catch (error) {
        console.error('%c❌ API 调用失败:', 'color: red; font-size: 14px;');
        console.error('   错误详情:', error.message);
        console.log('%c💡 请检查:', 'color: orange;');
        console.log('   1. API 服务器是否正常运行');
        console.log('   2. 网络连接是否正常');
        console.log('   3. 控制台是否有其他错误信息');

        this.status = {
          type: 'error',
          message: `❌ API 调用失败: ${error.message}`,
        };
        this.processing = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.cookie-import-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-secondary-bg);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-secondary-bg-for-transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: var(--color-text);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: var(--color-secondary-bg-for-transparent);
    }
  }
}

.modal-body {
  padding: 24px;

  .input-section {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
      color: var(--color-text);
    }

    textarea {
      width: 100%;
      padding: 12px;
      border: 2px solid var(--color-secondary-bg-for-transparent);
      border-radius: 8px;
      background: var(--color-primary-bg-for-transparent);
      color: var(--color-text);
      font-size: 14px;
      font-family: 'Monaco', 'Menlo', monospace;
      resize: vertical;
      transition: all 0.2s;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
      }

      &::placeholder {
        color: var(--color-text);
        opacity: 0.48;
      }
    }
  }

  .notice {
    background: var(--color-primary-bg-for-transparent);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;

    p {
      margin: 0 0 12px 0;
      font-weight: 600;
      color: var(--color-text);
    }

    ol {
      margin: 0;
      padding-left: 20px;
      color: var(--color-text);
      opacity: 0.88;
      font-size: 13px;

      li {
        margin-bottom: 6px;
      }
    }
  }

  .status-message {
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;

    &.info {
      background: rgba(52, 152, 219, 0.1);
      color: #3498db;
    }

    &.success {
      background: rgba(46, 204, 113, 0.1);
      color: #2ecc71;
    }

    &.error {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
    }
  }
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-secondary-bg-for-transparent);
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  button {
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  .btn-cancel {
    background: var(--color-secondary-bg-for-transparent);
    color: var(--color-text);
  }

  .btn-confirm {
    background: var(--color-primary);
    color: white;
  }
}

.loading {
  display: inline-flex;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: loading 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loading {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
