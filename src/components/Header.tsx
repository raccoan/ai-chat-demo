interface HeaderProps {
  title: string
  onMenuClick?: () => void   // 新增
}

function Header(props: HeaderProps) {
  return (
    <div className="header">
      <button className="menu-btn" onClick={props.onMenuClick}>
        ☰
      </button>
      <h1>{props.title}</h1>
    </div>
  )
}

export default Header