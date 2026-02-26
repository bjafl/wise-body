import { useState, useEffect, useCallback } from 'react';

export function useContextMenu() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault(); // Stops the default browser menu
    setPosition({ x: e.pageX, y: e.pageY });
    setShowMenu(true);
  }, []);

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  return { position, showMenu, handleContextMenu };
}
