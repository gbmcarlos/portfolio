var Core = {

    options: {},
    characters: {},
    selections: {},

    init: function () {
        this.readOptions();
        this.setupCharactersGrid();
        this.setupSelections();
        this.setupControls();
    },

    readOptions: function () {

        this.options.selectionSectionHeight = parseInt(this.getUrlParameter('selection_section_height', 70));
        this.options.charactersSectionHeight = 100 - this.options.selectionSectionHeight;
        this.options.selectionWidth = parseInt(this.getUrlParameter('selection_width', 330));
        this.options.selectionHeight = parseInt(this.getUrlParameter('selection_height', 480));
        this.options.characterWidth = parseInt(this.getUrlParameter('character_width', 70));
        this.options.characterHeight = parseInt(this.getUrlParameter('character_height', 95));
        this.options.charactersRows = parseInt(this.getUrlParameter('characters_rows', 2));
        this.options.charactersColumns = parseInt(this.getUrlParameter('characters_columns', 10));

    },

    setupCharactersGrid: function () {

        var gridContainer = document.getElementById("characters-grid-container");

        var characterCount = 0;
        for (var i = 0; i < this.options.charactersRows; i++) {

            var rowElement = document.createElement("tr");

            for (var j = 0; j < this.options.charactersColumns; j++) {

                var columnElement = this.createCharacterCellElement(characterCount);
                rowElement.appendChild(columnElement);
                characterCount++;

            }

            gridContainer.appendChild(rowElement);

        }

        document.getElementById("characters-section").style.height = this.options.charactersSectionHeight + "%";

    },

    createCharacterCellElement: function (characterIndex) {

        var cellElement = document.createElement("td");
        cellElement.id = "character-container-" + characterIndex;
        cellElement.className = "character-cell";

        var canvasElement = document.createElement("canvas");
        canvasElement.id = "character-canvas-" + characterIndex;
        canvasElement.className = "character-canvas";

        var fileInputElement = document.createElement("input");
        fileInputElement.id = "character-file-input-" + characterIndex;
        fileInputElement.type = "file";
        fileInputElement.hidden = true;

        var labelElement = document.createElement("label");
        labelElement.id = "character-input-label-" + characterIndex;
        labelElement.hidden = true;
        labelElement.htmlFor = fileInputElement.id;

        cellElement.appendChild(canvasElement);
        cellElement.appendChild(fileInputElement);
        cellElement.appendChild(labelElement);

        var canvas = new fabric.Canvas(canvasElement, {
            width: this.options.characterWidth,
            height: this.options.characterHeight
        });

        this.characters[characterIndex] = {
            canvas: canvas
        };

        fileInputElement.onchange = (function (event) {
            var reader = new FileReader();
            reader.onload = (function (event) {
                var rawImage = new Image();
                rawImage.src = event.target.result;
                rawImage.onload = (function () {
                    this.setCharacterImage(characterIndex, rawImage, null);
                }).bind(this);
            }).bind(this);
            reader.readAsDataURL(event.target.files[0]);
        }).bind(this);

        cellElement.ondblclick = function () {
            labelElement.click();
        }

        cellElement.onmouseenter = (function () {
            this.toggleImageControls(characterIndex, true);
        }).bind(this);

        cellElement.onmouseleave = (function () {
            this.toggleImageControls(characterIndex, false);
        }).bind(this);

        return cellElement;

    },

    setCharacterImage: function (characterIndex, rawImage, options) {

        this.characters[characterIndex].canvas.clear();

        // Prepare the image
        var image = new fabric.Image(rawImage);
        if (options != null) {
            image.set({
                left: options.left,
                top: options.top,
                scaleX: options.width / image.getScaledWidth(),
                scaleY: options.height / image.getScaledHeight()
            });
        } else {
            image.set({
                top: 0,
                left: 0
            });
            image.scaleToWidth(50);
        }

        // Add this image to the global list
        this.characters[characterIndex].image = image;
        this.characters[characterIndex].rawImage = rawImage;

        // Render the image
        this.characters[characterIndex].canvas.add(image).setActiveObject(image).renderAll();

        // Set the image's controls
        this.toggleImageControls(characterIndex, true);

    },

    getUrlParameter: function (parameterName, defaultValue) {

        var parameters = new URLSearchParams(window.location.search);

        if (parameters.has(parameterName)) {
            return parameters.get(parameterName);
        } else {
            return defaultValue;
        }

    },

    toggleImageControls: function (index, toggle) {

        if (!this.characters[index].image) {
            return;
        }

        var image = this.characters[index].image;
        var canvas = this.characters[index].canvas;

        image.setControlsVisibility({
            bl: toggle, br: toggle, tl: toggle, tr: toggle,
            mb: false, ml: false, mr: false, mt: false, mtr: false
        });
        canvas.renderAll();
    },

    setupSelections: function () {

        document.getElementById("selection-section").style.height = this.options.selectionSectionHeight + "%";

        this.selections[0] = {
            canvas: new fabric.Canvas('selection-canvas-0', {
                width: this.options.selectionWidth,
                height: this.options.selectionHeight
            }), image: null, index: 0
        };
        this.selections[1] = {
            canvas: new fabric.Canvas('selection-canvas-1', {
                width: this.options.selectionWidth,
                height: this.options.selectionHeight
            }), image: null, index: 0
        };

    },

    setupControls: function () {

        document.onkeydown = (async function (event) {

            switch (event.code) {
                // Player 0
                case "KeyD":
                    this.movePlayerSelection(0, 'x', true);
                    break;
                case "KeyA":
                    this.movePlayerSelection(0, 'x', false);
                    break;
                case "KeyW":
                    this.movePlayerSelection(0, 'y', true);
                    break;
                case "KeyS":
                    this.movePlayerSelection(0, 'y', false);
                    break;
                // Player 1
                case "ArrowRight":
                    this.movePlayerSelection(1, 'x', true);
                    break;
                case "ArrowLeft":
                    this.movePlayerSelection(1, 'x', false);
                    break;
                case "ArrowUp":
                    this.movePlayerSelection(1, 'y', true);
                    break;
                case "ArrowDown":
                    this.movePlayerSelection(1, 'y', false);
                    break;
                // Export/Import
                case "KeyE":
                    await this.export();
                    break;
                case "KeyI":
                    await this.import();
                    break;
            }

        }).bind(this);

    },

    movePlayerSelection: function (playerIndex, axis, positive) {

        var currentSelection = this.selections[playerIndex].index;
        var newSelection = null; // Invalid move by default

        if (axis == 'y') {

            if (positive) { // Move UP

                // You can move up as long as you're not on the top row
                if (currentSelection >= this.options.charactersColumns) {
                    newSelection = currentSelection - this.options.charactersColumns;
                }

            } else { // Move DOWN

                // You can move down as long as you're not on the bottom row
                if (currentSelection < (this.options.charactersColumns * (this.options.charactersRows - 1))) {
                    newSelection = currentSelection + this.options.charactersColumns;
                }

            }

        } else if (axis == 'x') {

            if (positive) { // Move Right

                // You can move to the right as long as you're not all the way to the right
                if ((currentSelection + 1) % this.options.charactersColumns != 0) {
                    newSelection = currentSelection + 1;
                }

            } else { // Move Left

                // You can move to the left as long as you're not all the way to the left
                if (currentSelection % this.options.charactersColumns != 0) {
                    newSelection = currentSelection - 1;
                }

            }

        }

        if (newSelection != null) {
            this.selections[playerIndex].index = newSelection;
            this.onPlayerSelection(playerIndex, newSelection);
        }

    },

    onPlayerSelection: function (playerIndex, selection) {

        if (!this.characters[selection] || !this.characters[selection].image) {
            return;
        }

        if (this.selections[playerIndex].image) {
            this.selections[playerIndex].canvas.clear();
        }

        this.characters[selection].image.cloneAsImage((function (image) {
            image.setControlsVisibility({
                bl: false, br: false, tl: false, tr: false,
                mb: false, ml: false, mr: false, mt: false, mtr: false
            });
            var ratio = 300 / 50;
            var left = this.characters[selection].image.aCoords.tl.x * ratio;
            var top = this.characters[selection].image.aCoords.tl.y * ratio;
            image.set({
                left: left,
                top: top
            });
            this.selections[playerIndex].canvas.add(image).setActiveObject(image).renderAll();
            this.selections[playerIndex].image = image;
        }).bind(this), {multiplier: 6});

    },

    export: async function() {

        var exportData = {};

        for (var i = 0; i < (this.options.charactersRows * this.options.charactersColumns); i++) {

            if (this.characters[i].rawImage) {

                var image = this.characters[i].image;
                exportData[i] = {
                    imageData: this.characters[i].rawImage.currentSrc,
                    options: {
                        width: image.getScaledWidth(),
                        height: image.getScaledHeight(),
                        left: image.aCoords.tl.x,
                        top: image.aCoords.tl.y
                    }
                };

            }

        }
        var jsonContent = JSON.stringify(exportData);

        const fileHandle = await window.showSaveFilePicker({
            types: [{
                accept: {'application/json': ['.json']}
            }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonContent);
        await writable.close();

    },

    import: async function() {

        var fileHandles = await window.showOpenFilePicker({
            types: [{
                accept: {'application/json': ['.json']}
            }],
            excludeAcceptAllOption: true,
            multiple: false
        });

        var file = await fileHandles[0].getFile();
        var fileContent = await file.text();
        var data = JSON.parse(fileContent);

        for (const characterIndex in data) {

            const rawImage = new Image();
            rawImage.onload = (function () {
                this.setCharacterImage(characterIndex, rawImage, data[characterIndex].options)
            }).bind(this);
            rawImage.src = data[characterIndex].imageData;

        }

    }

};