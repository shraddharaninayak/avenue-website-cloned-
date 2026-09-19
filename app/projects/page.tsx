import { redirect } from "next/navigation";

/** The projects are presented on the homepage; each has its own page below /projects. */
export default function ProjectsIndex() {
  redirect("/#projects");
}
