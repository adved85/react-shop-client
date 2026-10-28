// Example only: nothing imports this file.
//
// Components import API functions from src/api/ directly. A service is worth
// adding only when it does something on top of the HTTP call: combining
// requests, reshaping data for the UI, caching. A function that just awaits
// the API call and returns the result belongs in src/api/ alone.
import { getDepartments } from "../api/adminDepartments";

// Departments as <select> options labelled with their parent, e.g.
// "Men / Shoes". The API returns only parent_id, so the join happens here.
// Only the first page is read; a real version would request all of them.
export async function getDepartmentOptions() {
    const { items } = await getDepartments();
    const namesById = new Map(items.map((department) => [department.id, department.name]));

    return items.map((department) => ({
        value: department.id,
        label: department.parent_id
            ? `${namesById.get(department.parent_id)} / ${department.name}`
            : department.name,
    }));
}
