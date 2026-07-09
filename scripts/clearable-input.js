/**
 * Wraps a text/search <input> with a right-aligned "×" button that clears it, so users don't
 * have to manually select-and-delete after searching, filtering, or picking a value.
 * @param {HTMLInputElement} input the input to wrap
 * @returns {Element} a wrapper element containing the input and its clear button
 */
export default function makeClearable(input) {
  const wrapper = document.createElement('div');
  wrapper.className = 'clearable-input';
  wrapper.append(input);

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'clearable-input-clear';
  clearButton.textContent = '×';
  clearButton.setAttribute('aria-label', 'Clear');
  wrapper.append(clearButton);

  function sync() {
    clearButton.hidden = !input.value;
  }

  input.addEventListener('input', sync);
  clearButton.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    sync();
  });
  sync();

  return wrapper;
}
