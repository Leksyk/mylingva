/**
 * Determines whether the given DOM element produces visible output for the target page.
 * @param {Element} element
 * @returns {Boolean}
 */
function isDomElementVisible(element) {
  if(element.style.display == "none" ||
      element.style.visibility == "hidden" ||
	  element.style.visivility == "collapse") {
	return false;
  }

  var hiddenTags = ["SCRIPT","STYLE"];

  for(i = 0; i < hiddenTags.length; ++i) {
    if (hiddenTags[i] == element.tagName) {
	    return false;
	  }
  }
  return true;
}

/**
 * Returns the formatted text: no special characters at the ends of the string, no extra spaces.
 * @param {string} text
 * @returns {string}
 */
function formatText(text) {
  // Tries to remove all non-alphanumeric characters and digits.
  return text
	  .replace(/(^[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s\d]+)/g, '')
	  .replace(/([\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s\d]+$)/g, '')
	  .trim();
}
