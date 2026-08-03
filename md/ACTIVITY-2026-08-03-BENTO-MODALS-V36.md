# v36 — Bento Notification and Account Modals

- The Notifications card opens the live native GHL notification panel inside a
  Bento modal, preserving the panel's existing Vue event handlers.
- Closing the modal restores the panel to its native location and closes the
  underlying GHL popover.
- Account opens an accessible Bento modal whose Manage Account and Log Out
  actions delegate to the native Classic GHL profile menu.
- Escape, backdrop, and close-button dismissal are supported.
- All Bento cards and modal actions now share visible hover and focus feedback.

## QA

Test Notifications with unread content, filters, notification links, close,
backdrop close, and Escape. Test Account, Manage Your Account, and Log Out.
Confirm every Bento card and menu control has hover and keyboard-focus feedback.
