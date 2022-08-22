import { json } from "@remix-run/node";
import { RouteOptions, RouteParams } from "@encode42/remix-extras";
import { getVersion, getVersions } from "~/util/storage/getVersions.server";
import { Version, Versions } from "~/validation";
import { withTypes } from "~/util/api/withTypes";

export async function action({ request }: RouteOptions) {
    if (request.method !== "PATCH") {
        return null;
    }

    const body = await request.json();

    const validation = Versions.safeParse(body);
    if (!validation.success) {
        return json({
            "error": validation.error
        }, {
            "status": 400
        });
    }

    if (validation.data.types) {
        return await withTypes(validation.data.types);
    }

    return json({
        "versions": await getVersions()
    });
}

export async function loader({ params }: RouteParams) {
    const validation = Version.safeParse(params["*"]);
    if (!validation.success) {
        return json({
            "error": validation.error
        }, {
            "status": 400
        });
    }

    if (!validation.data) {
        const versions = await getVersions();
        return json({
            "versions": versions.versions
        });
    }

    const version = await getVersion(validation.data);

    return version ? json(version) : json({
        "error": "The specified version does not exist."
    }, {
        "status": 400
    });
}
