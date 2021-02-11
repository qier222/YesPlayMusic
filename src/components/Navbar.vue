<template>
  <nav :class="{ 'search-box-open': isSearchBoxOpen }">
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
      <a
        href="https://github.com/qier222/YesPlayMusic"
        target="blank"
        v-if="settings.showGithubIcon !== false"
        ><svg-icon icon-class="github" class="github"
      /></a>
      <button-icon @click.native="toggleSearchBox()" class="search-button">
        <svg-icon icon-class="search" />
      </button-icon>
      <div class="search-box">
        <div class="container" :class="{ active: inputFocus }">
          <svg-icon icon-class="search" />
          <div class="input">
            <input
              ref="searchInput"
              :placeholder="inputFocus ? '' : $t('nav.search')"
              v-model="keywords"
              @keydown.enter="doSearch"
              @focus="inputFocus = true"
              @blur="inputFocus = false"
            />
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import ButtonIcon from "@/components/ButtonIcon.vue";
import { mapState } from "vuex";

export default {
  name: "Navbar",
  components: {
    ButtonIcon,
  },
  data() {
    return {
      inputFocus: false,
      langs: ["zh-CN", "en"],
      keywords: "",
      isSearchBoxOpen: false,
    };
  },
  computed: {
    ...mapState(["settings"]),
  },
  methods: {
    go(where) {
      if (where === "back") this.$router.go(-1);
      else this.$router.go(1);
    },
    doSearch() {
      if (!this.keywords) return;
      if (
        this.$route.name === "search" &&
        this.$route.params.keywords === this.keywords
      ) {
        return;
      }
      this.$router.push({
        name: "search",
        params: { keywords: this.keywords },
      });
    },
    toggleSearchBox() {
      this.isSearchBoxOpen = !this.isSearchBoxOpen;
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
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid transparent;
  transition-property: padding-bottom, border-bottom;
  transition-duration: .4s;

  background-color: var(--color-navbar-bg);
  z-index: 100;
  -webkit-app-region: drag;
}

@media (max-width: 1336px) {
  nav {
    padding: 0 5vw;
  }
}

@supports (-moz-appearance: none) {
  nav {
    background-color: var(--color-body-bg);
  }
}

.navigation-buttons {
  flex: 1;
  display: flex;
  align-items: center;
  .svg-icon {
    height: 24px;
    width: 24px;
  }
  button {
    -webkit-app-region: no-drag;
  }
}
@media (max-width: 970px) {
  .navigation-buttons {
    flex: unset;
  }
}

.navigation-links {
  flex: 1;
  display: flex;
  justify-content: center;
  text-transform: uppercase;
  user-select: none;
  a {
    -webkit-app-region: no-drag;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--color-text);
    transition: 0.2s;
    margin: {
      right: 12px;
      left: 12px;
    }
    &:hover {
      background: var(--color-secondary-bg-for-transparent);
    }
    &:active {
      transform: scale(0.92);
      transition: 0.2s;
    }
  }
  a.active {
    color: var(--color-primary);
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
  -webkit-app-region: no-drag;

  .container {
    display: flex;
    align-items: center;
    height: 32px;
    background: var(--color-secondary-bg-for-transparent);
    border-radius: 8px;
    width: 200px;
  }

  .svg-icon {
    height: 15px;
    width: 15px;
    color: var(--color-text);
    opacity: 0.28;
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
    color: var(--color-text);
  }

  .active {
    background: var(--color-primary-bg-for-transparent);
    input,
    .svg-icon {
      opacity: 1;
      color: var(--color-primary);
    }
  }
}

[data-theme="dark"] {
  .search-box {
    .active {
      input,
      .svg-icon {
        color: var(--color-text);
      }
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
    color: var(--color-text);
    -webkit-app-region: no-drag;
  }
  .search-button {
    display: none;
  }
  @media (max-width: 600px) {
    .search-button {
      display: flex;
    }
  }
}

@media (max-width: 800px) {
  .navigation-links > a {
    margin: 4px;
  }
}

@media (max-width: 700px) {
  .navigation-buttons {
    display: none;
  }
}

@media (max-width: 600px) {
  nav.search-box-open {
    padding-bottom: 36px;
    border-bottom-color: var(--color-secondary-bg-for-transparent);
  }

  .search-box {
    display: block;
    position: fixed;
    top: 56px;
    left: 16px;
    right: 16px;
    .container {
      width: 100%;
      opacity: 0;
      height: 0;
      overflow: hidden;
      transition-property: height, opacity;
      transition-duration: .4s;
      .input {
        width: 100%;
      }
    }
  }

  nav.search-box-open .container {
    opacity: 1;
    height: 32px;
  }
}
</style>
