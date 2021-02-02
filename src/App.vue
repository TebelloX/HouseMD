<template>
  <div id="app">
    <div class="titlebar">
      <div class="logo">HouseMD</div>
      <div class="menu">
        <div class="option" @click="newFile">
          <i class="mdi mdi-file"></i>
        </div>
        <div class="option" @click="openFile">
          <i class="mdi mdi-folder-open-outline"></i>
        </div>
        <div class="option" @click="saveFile">
          <i class="mdi mdi-content-save-outline"></i>
        </div>
        <div class="option" @click="saveFileAs">
          <i class="mdi mdi-content-save-alert-outline"></i>
        </div>
      </div>
      <div class="file" v-if="loadedFile !== ''">{{loadedFile}}</div>
      <div class="file" v-else>Untitled</div>
      <div class="window-controls">
        <button class="winctrl" @click="minApp"><i class="mdi mdi-minus"></i></button>
        <button class="winctrl" @click="maxApp"><i class="mdi mdi-window-maximize"></i></button>
        <button class="winctrl quit" @click="quitApp"><i class="mdi mdi-close"></i></button>
      </div>
    </div>
    <div class="columns">
      <div class="column editor">
        <editor v-model="markdown" @init="editorInit" lang="markdown" theme="dracula" width="100%" height="100vh"></editor>
      </div>
      <div class="column">
        <VueMarkdown :source="markdown" class="markdown">{{markdown}}</VueMarkdown>
      </div>
    </div>
  </div>
</template>

<script>
const { dialog } = window.require('electron').remote;
const { remote } = window.require('electron');
const fs = window.require('fs');
import VueMarkdown from 'vue-markdown'

export default {
  name: 'App',
  components: {
    VueMarkdown,
    editor: require('vue2-ace-editor'),
  },
  data() {
    return {
      markdown: this.$store.state.markdown,
      awaitSave: false,
      loadedFromFile: false,
      loadedFile: ''
    }
  },
  mounted() {
    document.title = "HouseMD"
  },
  methods: {
    editorInit: function() {
      require('brace/ext/language_tools')
      require('brace/mode/markdown')
      require('brace/theme/dracula')
    },
    newFile() {
      this.$store.commit('updateMarkdown', '');
      this.markdown = this.$store.state.markdown;
      this.loadedFromFile = false;
      this.loadedFile = '';
    },
    openFile() {
      var openfd = dialog.showOpenDialog({
        title: 'Open File'
      }).then(result => {
        if (!result.canceled) {
          openfd = result.filePaths[0];
          var contents = fs.readFileSync(openfd, "utf-8");
          this.loadedFile = openfd;
          this.$store.commit('updateMarkdown', contents);
          this.markdown = this.$store.state.markdown;
          this.loadedFromFile = true;
        }
      });
    },
    saveFile() {
      if (this.loadedFile !== '') {
        fs.writeFileSync(this.loadedFile, this.markdown);
      } else {
        this.saveFileAs();
      }
    },
    saveFileAs() {
      var savefd = dialog.showSaveDialog({
        title: 'Save File',
        filters: [{name: 'Markdown', extensions: ['md']}]
      }).then(result => {
        if (!result.canceled) {
          savefd = result.filePath;
          fs.writeFileSync(savefd, this.markdown);
          this.loadedFile = savefd;
        }
      });
    },
    minApp() {
      remote.getCurrentWindow().minimize();
    },
    maxApp() {
      remote.getCurrentWindow().maximize();
    },
    quitApp() {
      remote.getCurrentWindow().close();
    }
  },
  watch: {
    markdown: function() {
      if (!this.awaitSave) {
        setTimeout(() => {
          this.$store.commit('updateMarkdown', this.markdown);
          this.awaitSave = false;
          if (!this.loadedFromFile) {
            this.$store.commit('saveMarkdown', this.markdown);
          }
        }, 1000)
      }
      this.awaitSave = true;
    },
  }
}
</script>

<style>
/* Material Design Icons */
@import url('https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css');
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300&display=swap');

body, html {
  overflow: hidden !important;
  margin: 0;
  padding: 0;
}

.markdown {
  padding: 20px;
  font-family: 'Nunito Sans', sans-serif;
  background: #282a36;
  height: 100vh;
  overflow-y: auto;
  color: white;
  /*
  -webkit-app-region: drag;
  -webkit-user-select: none;
  */
}

.markdown a {
  color: hsl(171, 100%, 41%);
}

.markdown hr {
  opacity: 0.2;
}

.markdown pre {
  padding: 10px;
  background: rgba(1,1,1,0.3);
  border-radius: 6px;
}

.markdown pre code[class^="language-"] {
  padding: 0;
  background: none;
  border-radius: none;
  color: white;
  font-size: 12pt;
}

.markdown code {
  /* padding: 4px; */
  /* background: rgba(1,1,1,0.3); */
  /* border-radius: 5px; */
  font-family: 'Fira Code' !important;
  font-size: 11pt;
  color: hsl(171, 100%, 41%);
}

.markdown b, h1, h2, h3, h4, h5, h6, strong {
  font-weight: 300;
}

.markdown p, div {
  font-weight: 200;
}

.markdown blockquote {
  background: rgba(1,1,1,0.3);
  border-left: 2px solid rgba(255,255,255,0.3);
}

.markdown blockquote p {
  padding: 10px;
}

.columns {
  display: grid;
  grid-template-columns: 50% 50%;
}

.column {
  box-sizing: border-box;
}

.ace_editor {
  font-family: 'Fira Code' !important;
  font-size: 10pt;
}

.editor {
  border-right: 2px solid #4d5167;
}

.titlebar {
  height: 30px;
  width: 100vw;
  -webkit-app-region: drag;
  -webkit-user-select: none;
  background: #282a36;
  font-family: 'Nunito Sans', sans-serif;
}

.logo {
  float: left;
  line-height: 30px;
  color: hsl(171, 100%, 41%);
  margin-left: 10px;
  font-family: 'Fira Code';
}

.file {
  display: inline-flex;
  color: #75798f;
  line-height: 30px;
}

.menu {
  /* float: left; */
  color: white;
  -webkit-app-region: none;
  margin-left: 6px;
  display: inline-flex;
}

.option {
  line-height: 30px;
  height: 30px;
  width: 40px;
  text-align: center;
}

.option:hover {
  background: #404357;
}

.window-controls {
  float: right;
  -webkit-app-region: none;
}

.winctrl {
  width: 50px;
  height: 30px;
  border: none;
  outline: none;
  background: #282a36;
  color: white;
}

.winctrl:hover {
  background: #404357;
}

.winctrl.quit:hover {
  background: hsl(348, 100%, 61%);
}

::-webkit-scrollbar {
  width: 0.6em;
  height: 0.6em;
}

::-webkit-scrollbar-track {
  background: none;
}

::-webkit-scrollbar-thumb {
  background: #404357;
}

::-webkit-scrollbar-corner {
  display: none;
}
</style>
