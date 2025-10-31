/**
 * Custom error class for session expiration (401 Unauthorized responses).
 * This error is thrown when the server returns a 401 status, indicating
 * the user's session has expired and they need to log in again.
 */
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please log in again.");
    this.name = "SessionExpiredError";
  }
}

/**
 * A wrapper around the native `fetch` function that automatically handles
 * authentication-related concerns, specifically 401 Unauthorized responses.
 *
 * @param {string} url The URL to fetch.
 * @param {RequestInit} [options] The options for the fetch request, same as the native `fetch`.
 * @returns {Promise<Response>} A promise that resolves to the `Response` object.
 *
 * @description
 * This helper function provides a centralized way to make API calls.
 *
 * Key features:
 * 1. **Automatic Credentials**: It automatically includes `credentials: 'include'` in every
 *    request, which is necessary for cookie-based session management. This can be
 *    overridden if explicitly provided in the `options`.
 *
 * 2. **401 Interception**: If the server responds with a 401 Unauthorized status,
 *    it intercepts the response and handles the user session expiry gracefully:
 *    a. It saves the current URL pathname to `sessionStorage`. This allows the application
 *       to redirect the user back to the page they were on after they log in again.
 *    b. It dispatches a custom event that will be caught by the global context provider
 *       to handle navigation using React Router.
 *    c. It throws a `SessionExpiredError` to stop the execution chain and prevent
 *       further processing of the invalid response.
 *
 * 3. **Standard Fetch API**: For any other response status, it behaves exactly like the
 *    native `fetch` function, returning the response object for the caller to handle.
 */
export async function fetchWithAuth(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  // Merge default options with user-provided options.
  // 'credentials: include' is crucial for sending cookies for session management.
  const finalOptions: RequestInit = {
    credentials: "include",
    ...options,
  };

  const response = await fetch(url, finalOptions);

  if (response.status === 401) {
    console.log("Received 401 Unauthorized. Session expired.");

    // Save the current path to redirect back after successful login.
    try {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    } catch (error) {
      console.error("Failed to save redirect path to sessionStorage:", error);
    }

    // Dispatch a custom event to notify the app that the session has expired.
    // This event will be caught by the global context provider which will handle
    // navigation using React Router (which is allowed in Floot's iframe).
    window.dispatchEvent(new CustomEvent("session-expired"));

    // Throw the error to stop the execution chain and prevent any further
    // processing of the invalid response.
    throw new SessionExpiredError();
  }

  return response;
}