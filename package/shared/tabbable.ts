const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

const tabbables = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (element) => element.tabIndex >= 0 && element.getClientRects().length > 0,
  );

const nextTabbableAfter = (element: Element) =>
  tabbables(document).find(
    (candidate) =>
      !element.contains(candidate) &&
      element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

export { tabbables, nextTabbableAfter };
