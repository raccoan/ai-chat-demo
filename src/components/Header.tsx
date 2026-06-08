interface HeaderProps {
  title: string
}

function Header(props: HeaderProps) {
  return (
    <div className="header">
      {props.title}
    </div>
  )
}

export default Header