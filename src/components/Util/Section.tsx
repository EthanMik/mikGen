import { useState, type ReactNode } from "react";
import Separator from "./Separator";

type SectionProps = {
    name?: string;
    children?: ReactNode;
    defaultCollapsed?: boolean;
};

export default function Section({ name = "", children, defaultCollapsed = false }: SectionProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    if (!children) {
        return <Separator name="" />;
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Separator name={name} onClick={() => setCollapsed(c => !c)} isCollapsed={collapsed} />
            {!collapsed && children}
        </div>
    );
}
