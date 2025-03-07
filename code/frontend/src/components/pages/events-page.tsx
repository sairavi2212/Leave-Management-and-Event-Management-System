import Layout from "@/components/layout.tsx";
import EmailList from "@/components/email-list";
import CreateEmail from "@/components/create-email-dialog";

export default function EventsPage() {
    return (
        <Layout>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        width: "70vw",
                        height: "10vh",
                        display: "flex",
                        justifyContent: "right",
                    }}
                >
                    <CreateEmail />
                </div>
                <EmailList />
            </div>
        </Layout>
    );
}
