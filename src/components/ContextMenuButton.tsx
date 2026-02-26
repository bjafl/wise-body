const ActionButton = () => {
  const { position, showMenu, handleContextMenu } = useContextMenu();

  return (
    <div style={{ position: 'relative' }}>
      <button onContextMenu={handleContextMenu} className="trigger-button">
        Right Click Me
      </button>

      {showMenu && (
        <ul
          className="context-menu"
          style={{
            top: position.y,
            left: position.x,
            position: 'fixed', // Use fixed to avoid parent container clipping
            zIndex: 1000,
          }}
        >
          <li onClick={() => console.log('Edit')}>Edit</li>
          <li onClick={() => console.log('Delete')}>Delete</li>
        </ul>
      )}
    </div>
  );
};
