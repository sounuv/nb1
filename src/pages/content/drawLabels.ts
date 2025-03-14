import { getAccessibleName } from "accname";
import {
  VISIBLE_TEXT_ATTRIBUTE_NAME,
  ARIA_LABEL_ATTRIBUTE_NAME,
  NOVA_LABEL_ATTRIBUTE_NAME,
} from "../../constants";
import { type Knowledge } from "../../helpers/knowledge";

const styleElem = document.createElement("style");
styleElem.setAttribute("type", "text/css");
styleElem.innerHTML = `
._label_overlay_wrapper {
  position: absolute;
  z-index: 99999999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  background: unset;
  border: none;
}
._label_overlay_2 {
  position: absolute;
  opacity: 0.75;
  font-size: 9px;
  background-color: black;
  border: 1px solid red;
  border-radius: 2px;
}
._label_overlay_2 > span {
  color: #fff;
  position: absolute;
  z-index: 1;
  padding: 2px 5px;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}
`;
document.head.appendChild(styleElem);

function isElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isInputElement(node: Node): node is HTMLInputElement {
  return isElementNode(node) && node.tagName === "INPUT";
}
function isTextAreaElement(node: Node): node is HTMLTextAreaElement {
  return isElementNode(node) && node.tagName === "TEXTAREA";
}

function isTopElement(elem: Element, rect: DOMRect) {
  let topEl = document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );

  let found = false;
  while (topEl && topEl !== document.body) {
    if (topEl === elem) {
      found = true;
      break;
    }
    topEl = topEl.parentElement;
  }
  return found;
}

function isVisible(
  element: Element,
  checkViewport = false,
  checkCovered = false,
) {
  const style = getComputedStyle(element);
  const { display, visibility, opacity } = style;
  if (display === "none") return false;
  if (visibility !== "visible") return false;
  if (opacity != null && parseFloat(opacity) <= 0) return false;
  // don't respect 'aria-hidden' attribute since they are most likely visible in the screenshot
  // if (element.getAttribute('aria-hidden') === 'true') return false;

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  // check if the element is covered by other elements
  if (checkCovered && !isTopElement(element, rect)) return false;

  // check if the element is within the viewport
  if (checkViewport) {
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    if (
      rect.top > windowHeight ||
      rect.bottom < 0 ||
      rect.left > windowWidth ||
      rect.right < 0
    )
      return false;
  }

  return true;
}

type DomAttrs = {
  visibleText: string;
  ariaLabel: string;
};

const emptyDomAttrs: DomAttrs = {
  visibleText: "",
  ariaLabel: "",
};

// check if the node has the attributes we added
function isTouchedElement(elem: Element) {
  return (
    elem.hasAttribute(VISIBLE_TEXT_ATTRIBUTE_NAME) ||
    elem.hasAttribute(ARIA_LABEL_ATTRIBUTE_NAME)
  );
}

// find the visible text and best-match aria-label of the element
// note that this function has a side effect of writing the attributes in the DOM
function traverseDom(node: Node, selector: string): DomAttrs {
  if (node.nodeType === Node.TEXT_NODE) {
    return { visibleText: node.nodeValue ?? "", ariaLabel: "" };
  } else if (isElementNode(node)) {
    if (!isVisible(node)) return emptyDomAttrs; // skip if the element is not visible
    if (isTouchedElement(node)) {
      return {
        visibleText: node.getAttribute(VISIBLE_TEXT_ATTRIBUTE_NAME) ?? "",
        ariaLabel: node.getAttribute(ARIA_LABEL_ATTRIBUTE_NAME) ?? "",
      };
    }

    let visibleText = "";
    let ariaLabel = getAccessibleName(node);

    // skip children of SVGs because they have their own visibility rules
    if (node.tagName.toLocaleLowerCase() !== "svg") {
      for (const child of node.childNodes) {
        const result = traverseDom(child, selector);
        // aggregate visible text
        visibleText += " " + result.visibleText;
        visibleText = visibleText.trim();
        // if parent doesn't have it, set aria-label with the first one found
        if (ariaLabel.length === 0 && result.ariaLabel.length > 0) {
          ariaLabel = result.ariaLabel;
        }
      }
    }
    visibleText = removeEmojis(visibleText);

    // cache attributes in DOM
    node.setAttribute(VISIBLE_TEXT_ATTRIBUTE_NAME, visibleText);
    node.setAttribute(ARIA_LABEL_ATTRIBUTE_NAME, ariaLabel);
    return { visibleText, ariaLabel };
  }
  return emptyDomAttrs;
}

// It removes all symbols except:
// \p{L} - all letters from any language
// \p{N} - numbers
// \p{P} - punctuation
// \p{Z} - whitespace separators
function removeEmojis(label: string) {
  return label.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "").trim();
}

function drawLabel(
  wrapper: Element,
  elem: Element,
  label: string,
  zIndex: number,
) {
  const rect = elem.getBoundingClientRect();
  // Create a new <div>
  const overlayDiv = document.createElement("div");
  overlayDiv.classList.add("_label_overlay_2");
  // Set the overlay's styles to match the position and size of the element
  Object.assign(overlayDiv.style, {
    top: `${window.scrollY + rect.top}px`, // considering the scrolled amount
    left: `${window.scrollX + rect.left}px`, // considering the scrolled amount
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: zIndex, // place the overlay above previous ones
  });

  overlayDiv.innerHTML = `<span>${label}</span>`; // add the index of the element as text

  // Add the overlay to the wrapper
  wrapper.appendChild(overlayDiv);
}

// a large base z-index to start with
const baseZIndex = 10000;

type LabelDataWithElement = {
  element: Element;
  uid: string;
  name: string;
  tagName: string;
  role?: string;
  // for input elements
  currentValue?: string;
  placeholder?: string;
  active?: boolean;
};

export type LabelData = Omit<LabelDataWithElement, "element"> & {
  element?: never; // Element cannot be sent over the wire
};

function getLabelData(
  selector: string,
  knowledge: Knowledge,
): LabelDataWithElement[] {
  // Get all elements that match the selector
  const elements = document.querySelectorAll(selector);
  // Iterate over the elements
  let uid = 1;
  const data: LabelDataWithElement[] = [];
  function addLabel(name: string, elem: Element) {
    const uidString = uid.toString();

    const item: LabelDataWithElement = {
      uid: uidString,
      name,
      tagName: elem.tagName,
      element: elem,
    };
    if (isInputElement(elem) || isTextAreaElement(elem)) {
      item.currentValue = elem.value;
      item.placeholder = elem.placeholder;
      item.active = document.activeElement === elem;
    }
    if (elem.hasAttribute("role")) {
      item.role = elem.getAttribute("role") ?? "unknown";
    }
    data.push(item);
    elem.setAttribute(NOVA_LABEL_ATTRIBUTE_NAME, uidString);
    uid++;
  }
  let specialElements: Element[] = [];
  // annotation rules from knowledge has higher priority
  if (knowledge.annotationRules != null) {
    for (const rule of knowledge.annotationRules) {
      specialElements = [...document.querySelectorAll(rule.selector)];
      specialElements.forEach((elem) => {
        if (elem.id === "nb1-side-button" || elem.id === "fake-mouse-container") return;
        if (
          !rule.allowAriaHidden &&
          elem.getAttribute("aria-hidden") === "true"
        )
          return;
        if (!rule.allowInvisible && !isVisible(elem, true, !rule.allowCovered))
          return;
        let label = rule.useStaticName || "";
        if (label.length === 0 && rule.useAttributeAsName) {
          label = elem.getAttribute(rule.useAttributeAsName) ?? "";
        }
        // fallback to use aria-label
        if (label.length === 0) {
          label = getAccessibleName(elem);
        }
        // fallback to use text content
        if (label.length === 0) {
          label = elem.textContent ?? "";
        }
        if (label.length === 0) {
          console.warn(
            "Warning: No label found for knowledge rule matched element",
            elem,
          );
        }
        addLabel(label, elem);
      });
    }
  }
  elements.forEach((elem) => {
    // skip if the element is disabled
    if (elem.getAttribute("disabled") != null) return;
    // skip specialElements
    if (elem.hasAttribute(NOVA_LABEL_ATTRIBUTE_NAME)) return;
    // skip if the element is already touched
    // this is avoid cases where the selector matches nested elements, e.g. an input and its parent label
    if (isTouchedElement(elem)) return;
    // if the element has aria-hidden="true", skip it
    if (elem.getAttribute("aria-hidden") === "true") return;
    // if the element is not visible, skip it
    if (!isVisible(elem, true, true)) return;
    // skip if the element has id "nb1-side-button"
    if (elem.id === "nb1-side-button" || elem.id === "fake-mouse-container") return;

    const { visibleText, ariaLabel } = traverseDom(elem, selector);
    // use aria-label as name, otherwise use visible text
    if (ariaLabel !== "") {
      addLabel(ariaLabel, elem);
      return;
    }
    addLabel(visibleText, elem);
  });
  return data;
}

export function addLabelsToDom(data: LabelDataWithElement[]) {
  // wrapper element
  const wrapper = document.createElement("div");
  wrapper.classList.add("_label_overlay_wrapper");
  wrapper.popover = "manual";
  data.forEach(({ element, uid }, index) => {
    drawLabel(wrapper, element, uid, baseZIndex + data.length - index);
  });
  // set wrapper's width and height to match body
  wrapper.style.width = `${document.documentElement.scrollWidth}px`;
  wrapper.style.height = `${document.documentElement.scrollHeight}px`;
  document.documentElement.appendChild(wrapper);
  // this method does not exist on Firefox yet (this code only runs on Chrome, but just in case)
  wrapper.togglePopover && wrapper.togglePopover();
}

export function removeLabels() {
  document.querySelectorAll("._label_overlay_wrapper").forEach((elem) => {
    elem.remove();
  });
}

const clickableRoles = [
  "button",
  "checkbox",
  "combobox",
  "gridcell",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "switch",
  "tab",
  "textbox",
  "togglebutton",
  "treeitem",
];

// This selector should match most interactive elements that we want to label
// it doesn't pick elements with only cursor: 'pointer' in computed style; we can revisit this if needed
const selectorForInteractiveElements =
  "a, button, details, input, label, option, select, textarea, " +
  "[onclick], [onmouseover], [onmousedown], [onmouseup]," + // we don't include keyboard events yet
  clickableRoles.map((role) => `[role="${role}"]`).join(", ");

function removeAttributeFromAllElements(attribute: string) {
  document.querySelectorAll(`[${attribute}]`).forEach((elem) => {
    elem.removeAttribute(attribute);
  });
}

export function drawLabels(knowledge: Knowledge = {}): LabelData[] {
  // clean up previous attributes since they might be outdated
  // TODO: should be possible to avoid this by keeping track of the elements we touched in a better way
  removeAttributeFromAllElements(NOVA_LABEL_ATTRIBUTE_NAME);
  removeAttributeFromAllElements(VISIBLE_TEXT_ATTRIBUTE_NAME);
  removeAttributeFromAllElements(ARIA_LABEL_ATTRIBUTE_NAME);

  const data = getLabelData(selectorForInteractiveElements, knowledge);
  addLabelsToDom(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return data.map(({ element, ...rest }) => rest);
}
