// The docs are a separate Docusaurus build deployed next to the app rather than a route inside
// it, so this is a plain link out instead of anything the app routes to itself
const DOCS_URL = "https://mikgen.com/docs";

// Styled to match MenuButtonTemplate's trigger so it lines up with File/Edit/View/Settings, but it
// opens the docs instead of a menu, so it has none of that template's open/close machinery
export default function HelpButton() {
    return (
        <div className="relative rounded-sm hover:bg-medgray_hover">
            <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-1 cursor-pointer"
            >
                <span className="text-[12px] leading-none">Help</span>
            </a>
        </div>
    );
}
