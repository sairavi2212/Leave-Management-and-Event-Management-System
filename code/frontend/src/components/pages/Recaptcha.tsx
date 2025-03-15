import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

// Define props interface
interface ReCaptchaProps {
  sitekey: string;
  onChange: (value: string | null) => void;
  theme?: 'light' | 'dark';
}

// Define ref interface
export interface ReCAPTCHA {
  reset: () => void;
  execute: () => void;
  getValue: () => string | null;
}

// Define global types for Google reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: any) => number;
      reset: (widgetId: number) => void;
      execute: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
    onloadCallback?: () => void;
  }
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ sitekey, onChange, theme = 'light' }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
          onChange(null);
        }
      },
      execute: () => {
        if (widgetIdRef.current !== null) {
          window.grecaptcha.execute(widgetIdRef.current);
        }
      },
      getValue: () => {
        if (widgetIdRef.current !== null) {
          return window.grecaptcha.getResponse(widgetIdRef.current);
        }
        return null;
      }
    }));

    useEffect(() => {
      // Load reCAPTCHA script if it hasn't been loaded yet
      if (!window.grecaptcha) {
        // Create global callback function
        window.onloadCallback = () => {
          renderCaptcha();
        };

        // Load the script
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } else {
        renderCaptcha();
      }

      // Function to render the captcha
      function renderCaptcha() {
        if (divRef.current) {
          widgetIdRef.current = window.grecaptcha.render(divRef.current, {
            sitekey,
            theme,
            callback: (value: string) => {
              onChange(value);
            },
            'expired-callback': () => {
              onChange(null);
            },
            'error-callback': () => {
              onChange(null);
            }
          });
        }
      }

      // Cleanup
      return () => {
        window.onloadCallback = undefined;
      };
    }, [sitekey, theme, onChange]);

    return <div ref={divRef} />;
  }
);

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;