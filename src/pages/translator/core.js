var Core = {

    editors: {},
    fileHandles : {},
    modal: {
        instance: null,
        editorIndex: null
    },

    init: function() {
        this.initOpenFileInput(0);
        this.initOpenFileInput(1);
        this.initModal();
    },

    /*
    When the "Open" button is clicked, we read a file
    Then, list the chapters
     */
    initOpenFileInput: function(editorIndex) {

        document.getElementById("open-file-button-" + editorIndex).addEventListener('click', (async() => {

            // Read a file
            var fileHandles = await window.showOpenFilePicker({
                types: [{
                    accept: {'application/xml': ['.xml']}
                }],
                excludeAcceptAllOption: true,
                multiple: false
            });
            // Save it in the steate
            this.fileHandles[editorIndex] = fileHandles[0];
            // List the chapters
            await this.listChapters(editorIndex);

        }).bind(this));

    },

    /*
    We ask the Book to get the list of chapters from the fileHandle
    Replace the list of options in the select with the new list of chapters
    Then save current editorIndex to the state, and open the modal
     */
    async listChapters(editorIndex) {

        var chapters = await Book.listChapters(this.fileHandles[editorIndex]);
        var listElement = document.getElementById("chapters-list");

        // Remove all the options (except the first one)
        listElement.value = "";
        var i, length = listElement.options.length - 1;
        for (i = length; i > 0; i--) {
            listElement.remove(i);
        }

        // Add all the options
        for (i = 0; i < chapters.length; i++) {
            var optionElement = document.createElement('option');
            optionElement.value = i;
            optionElement.innerHTML = "Chapter " + i;
            listElement.appendChild(optionElement);

        }

        // Save the editor index, so we know it again when the chapter is selected
        this.modal.editorIndex = editorIndex;
        this.modal.instance.show();

    },

    /*
    If there is a previous instance of an editor, destroy it.
    Ask the Book to read the chapter
     */
    initEditor: async function(editorIndex, chapterIndex) {

        // Destroy the previous instance, if any
        if (this.editors[editorIndex]) {
            this.editors[editorIndex].instance.destroy();
        }

        var editorContent = await Book.getChapterContent(this.fileHandles[editorIndex], chapterIndex);

        // Update the state
        this.editors[editorIndex] = {
            instance: new EditorJS({
                holder: "editor-container-" + editorIndex,
                data: editorContent,
                onChange: (function() {
                    this.updateEditorBlockCount(editorIndex);
                }).bind(this),
                onReady: (function() {
                    this.updateEditorBlockCount(editorIndex);
                }).bind(this)
            }),
            chapterIndex: chapterIndex
        };

        this.initSaveFileInput(editorIndex);

    },

    updateEditorBlockCount: function(editorIndex) {

        var blockCount = this.editors[editorIndex].instance.blocks.getBlocksCount();
        document.getElementById("block-count-label-" + editorIndex).innerHTML = blockCount;

    },

    initSaveFileInput: function (editorIndex) {

        document.getElementById("save-file-button-" + editorIndex).addEventListener('click', async() => {

            this.editors[editorIndex].instance.save().then((async (data) => {

                await Book.writeChapterContent(
                    this.editors[editorIndex].chapterIndex,
                    this.fileHandles[editorIndex],
                    data
                );

            }).bind(this));

        });

    },

    /*
    When a chapter is selected, init the editor to the specific chapter
     */
    initModal: function() {

        this.modal.instance = new bootstrap.Modal('#chapters-modal');
        document.getElementById("chapters-list").addEventListener('change', (function() {

            this.modal.instance.hide();

            var selectedChapter = parseInt(document.getElementById("chapters-list").value);
            this.initEditor(
                this.modal.editorIndex,
                selectedChapter
            );

        }).bind(this));

    }

};
