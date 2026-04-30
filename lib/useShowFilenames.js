import { useState, useEffect } from 'react';

export function useShowFilenames() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const flag = params.get('dm-fn');
      if (flag === '1') localStorage.setItem('sb-show-filenames', '1');
      else if (flag === '0') localStorage.removeItem('sb-show-filenames');
      setShow(localStorage.getItem('sb-show-filenames') === '1');
    } catch {}
  }, []);

  return show;
}
