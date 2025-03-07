
import Email from "@/components/email";

import { ScrollArea } from "@/components/ui/scroll-area";

var List = [
    {
        id: 1,
        Title: "Event in Hoshangabad!",
        Email: "eklavya_admin@skibidi.com",
        Description:
            "This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet.",
    },
    {
        id: 2,
        Title: "Event in Wakanda!",
        Email: "tchalla@avenge.com",
        Description: "Wakanda Forever!",
    },
    {
        id: 3,
        Title: "Event in Gotham!",
        Email: "Batman6969@wayne_industries.com",
        Description: "Alfred's birthday party! All of you are invited!!!",
    },
    {
        id: 4,
        Title: "Event in Hoshangabad!",
        Email: "eklavya_admin@skibidi.com",
        Description:
            "This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet. This is a very elaborate and accurate description of the event that will be taking place in a specified location loreum ipsum dolor sit amet.",
    },
    {
        id: 5,
        Title: "Event in Wakanda!",
        Email: "tchalla@avenge.com",
        Description: "Wakanda Forever!",
    },
    {
        id: 6,
        Title: "Event in Gotham!",
        Email: "Batman6969@wayne_industries.com",
        Description: "Alfred's birthday party! All of you are invited!!!",
    },
];

export default function EmailList() {
    return (
        <ScrollArea style={{height: "90vh"}}>
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                {List.map((email) => (
                    <>
                        <div key={email.id} style={{ padding: "1rem" }}>
                            <Email
                                Title={email.Title}
                                Email={email.Email}
                                Description={email.Description}
                            />
                        </div>
                    </>
                ))}
            </div>
        </ScrollArea>
    );
}
