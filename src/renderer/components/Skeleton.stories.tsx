import { Story } from "@ladle/react";
import Skeleton, { SkeletonProps } from "./Skeleton";

export const SkeletonWithContent: Story<SkeletonProps> = (args) => <Skeleton {...args} />;
SkeletonWithContent.args = {
    children: "Loading..."
}
