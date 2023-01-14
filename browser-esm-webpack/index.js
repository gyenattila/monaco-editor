import * as monaco from 'monaco-editor';

const functionNameListDiv = document.getElementById('function-name-list');
const monacoContainerDiv = document.getElementById('monaco-container');
const selectedFunctionHeader = document.getElementById('selected-function');

/**
 * File read functions
 */
document.getElementById('file-reader').addEventListener('change', e => {
  let reader = new FileReader()
  reader.onload = onReaderLoad;

  reader.readAsText(e.target.files[0])
});

/**
 * Load when new file is selected
 */
const onReaderLoad = e => {
  /** Reset the div containers' content before load the new values into them. */
  functionNameListDiv.innerHTML = '';
  monacoContainerDiv.innerHTML = '';
  selectedFunctionHeader.innerHTML = '';

  /** Parse the new file and create a JSON formatted content. */
  const editorList = JSON.parse(e.target.result)

  const functionNamesSet = new Set();

  for (const elem of editorList) functionNamesSet.add(elem.functionName);

  /** Create a list from function names. */
  for (const elem of functionNamesSet) {
    const li =  document.createElement('li');
    li.innerHTML = elem;
    li.style.cursor = 'pointer';

    functionNameListDiv.appendChild(li)
  }

  for (const listElem of document.getElementsByTagName('li')) {
    listElem.addEventListener('click', e => {
      monacoContainerDiv.innerHTML = '';
      selectedFunctionHeader.innerHTML = e.target.innerText;

      const filteredElems = editorList.filter(
        listItem => listItem.functionName === e.target.innerText
      );

      for (const elem of filteredElems) {
        const div = document.createElement('div');
        div.id = elem.id;
        div.style.width = '80%';
        div.style.height = '300px';
        div.style.border = '1px solid black';
        div.style.margin = '0 auto 20px auto';
        monacoContainerDiv.appendChild(div)

        createNewMEInstance(elem);
      }
    })
  }

  const createNewMEInstance = elem => {
    const model = monaco.editor.createModel([elem.fileContent].join('\n'), 'cpp');
    monaco.editor.create(document.getElementById(elem.id), { model });

    validate(model, elem);
  };

  function validate(model, elem) {
    const markers = [];
    const { missingNoExcepts } = elem;

    for (const missingNoExcept of missingNoExcepts) {
      const  { message, lineNumber } = missingNoExcept;
      markers.push({
        message: message,
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: lineNumber,
        endLineNumber: lineNumber,
        startColumn: model.getLineFirstNonWhitespaceColumn(lineNumber),
        endColumn: model.getLineLength(lineNumber) + 1
    });
    }

    monaco.editor.setModelMarkers(model, 'owner', markers);
  }
}
