<template>
  <nav>
    <div class="navigation-buttons">
      <button-icon @click.native="go('back')"
        ><svg-icon icon-class="arrow-left"
      /></button-icon>
      <button-icon @click.native="go('forward')"
        ><svg-icon icon-class="arrow-right"
      /></button-icon>
    </div>
    <div class="navigation-links">
      <router-link to="/" :class="{ active: this.$route.name === 'home' }">{{
        $t("nav.home")
      }}</router-link>
      <router-link
        to="/explore"
        :class="{ active: this.$route.name === 'explore' }"
        >{{ $t("nav.explore") }}</router-link
      >
      <router-link
        to="/library"
        :class="{ active: this.$route.name === 'library' }"
        >{{ $t("nav.library") }}</router-link
      >
    </div>
    <div class="right-part">
      <a href="https://github.com/qier222/YesPlayMusic" target="blank"
        ><svg-icon icon-class="github" class="github"
      /></a>
      <div class="search-box">
        <div class="container" :class="{ active: inputFocus }">
          <svg-icon icon-class="search" />
          <div class="input">
            <input
              :placeholder="inputFocus ? '' : $t('nav.search')"
              v-model="keywords"
              @keydown.enter="goToSearchPage"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
            />
          </div>
        </div>
      </div>
      <div class="locale-changer" @click="changeLang">
        <svg-icon icon-class="translation" class="translation" />
      </div>
    </div>
  </nav>
</template>

<script>
import ButtonIcon from "@/components/ButtonIcon.vue";

export default {
  name: "Navbar",
  components: {
    ButtonIcon,
  },
  data() {
    return {
      inputFocus: false,
      keywords: "",
      langs: ["zh-CN", "en"],
    };
  },
  methods: {
    go(where) {
      if (where === "back") this.$router.go(-1);
      else this.$router.go(1);
    },
    goToSearchPage() {
      if (!this.keywords) return;
      if (
        this.$route.name === "search" &&
        this.$route.query.keywords === this.keywords
      )
        return;
      this.$router.push({
        name: "search",
        query: { keywords: this.keywords },
      });
    },
    changeLang() {
      let lang = "";
      if (this.$i18n.locale === "zh-CN") {
        lang = "en";
      } else {
        lang = "zh-CN";
      }
      this.$i18n.locale = lang;
      this.$store.commit("changeLang", lang);
    },
  },
};
</script>

<style lang="scss" scoped>
nav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: {
    right: 10vw;
    left: 10vw;
  }
  backdrop-filter: saturate(180%) blur(30px);
  background-color: rgba(255, 255, 255, 0.86);
  z-index: 100;
}

.navigation-buttons {
  flex: 1;
  display: flex;
  align-items: center;
  .svg-icon {
    height: 24px;
    width: 24px;
  }
}
.navigation-links {
  flex: 1;
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  a {
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    border-radius: 6px;
    padding: 6px 10px;
    color: black;
    transition: 0.2s;
    margin: {
      right: 12px;
      left: 12px;
    }
    &:hover {
      background: #eaeffd;
      color: #335eea;
    }
    &:active {
      transform: scale(0.92);
      transition: 0.2s;
    }
  }
  a.active {
    color: #335eea;
  }
}

.search {
  .svg-icon {
    height: 18px;
    width: 18px;
  }
}

.search-box {
  display: flex;

  justify-content: flex-end;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: #aaaaaa;
    margin: {
      left: 8px;
      right: 4px;
    }
  }

  input {
    font-size: 16px;
    border: none;
    background: transparent;
    width: 96%;
    font-weight: 600;
    margin-top: -1px;
  }

  .active {
    background: #eaeffd;
    input,
    .svg-icon {
      color: #335eea;
    }
  }
}

.right-part {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  .github {
    margin-right: 16px;
    height: 24px;
    width: 24px;
  }
}

.locale-changer {
  position: relative;
  .translation {
    margin-left: 16px;
    height: 48px;
    width: 48px;
  }
}
</style>
