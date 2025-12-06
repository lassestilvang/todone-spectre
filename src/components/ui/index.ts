// Mock UI components for development
export const Button = () => null;
export const Card = () => null;
export const Badge = () => null;
export const Checkbox = () => null;
export const Input = () => null;
export const Label = () => null;
export const Select = () => null;
export const Switch = () => null;
export const Tabs = () => null;
export const Textarea = () => null;
export const Dialog = () => null;
export const DropdownMenu = () => null;
export const Alert = () => null;
export const Avatar = () => null;
export const Popover = () => null;
export const Progress = () => null;
export const DateRangePicker = () => null;
export const Tooltip = () => null;

// For compound components
export namespace Card {
  export const Content = () => null;
  export const Header = () => null;
  export const Footer = () => null;
  export const Title = () => null;
  export const Description = () => null;
}

export namespace Select {
  export const Content = () => null;
  export const Item = () => null;
  export const Trigger = () => null;
  export const Value = () => null;
  export const Group = () => null;
  export const Label = () => null;
}

export namespace Dialog {
  export const Content = () => null;
  export const Header = () => null;
  export const Footer = () => null;
  export const Title = () => null;
  export const Description = () => null;
  export const Trigger = () => null;
  export const Close = () => null;
}

export namespace DropdownMenu {
  export const Content = () => null;
  export const Item = () => null;
  export const Trigger = () => null;
  export const Separator = () => null;
  export const CheckboxItem = () => null;
  export const RadioItem = () => null;
  export const Label = () => null;
  export const ShortcutLabel = () => null;
  export const Group = () => null;
  export const Portal = () => null;
  export const Sub = () => null;
  export const SubContent = () => null;
  export const SubTrigger = () => null;
  export const RadioGroup = () => null;
}

export namespace Tabs {
  export const Content = () => null;
  export const List = () => null;
  export const Trigger = () => null;
}

export namespace Popover {
  export const Content = () => null;
  export const Trigger = () => null;
  export const Anchor = () => null;
  export const Close = () => null;
}

export namespace Avatar {
  export const Image = () => null;
  export const Fallback = () => null;
}

export namespace Alert {
  export const Title = () => null;
  export const Description = () => null;
}

// Export as both named and default where needed
export default {
  Button,
  Card,
  Badge,
  Checkbox,
  Input,
  Label,
  Select,
  Switch,
  Tabs,
  Textarea,
  Dialog,
  DropdownMenu,
  Alert,
  Avatar,
  Popover,
  Progress,
  DateRangePicker,
  Tooltip,
};
