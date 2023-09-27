import { createWebHashHistory, createRouter } from "vue-router";
import useGlobalLoadingBar from "@/hooks/useGlobalLoadingBar";
const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "Home",
            redirect: {
                name: "edit"
            },
            children: [
                {
                    name: "edit",
                    path: "/edit",
                    component: () => import("@/views/ProfileEdit.vue")
                },
                {
                    name: "preview",
                    path: "/preview",
                    component: () => import("@/views/ProfilePreview.vue")
                }
            ]
        },
        {
            name: "notFound",
            path: "/:notFound(.*)",
            redirect: {
                name: "edit"
            }
        }
    ]
});
router.beforeEach((from, to, next) => {
    useGlobalLoadingBar().start();
    return next();
});
router.afterEach(() => {
    useGlobalLoadingBar().finish();
});
export default router;
