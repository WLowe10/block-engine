type AddProps = {
    num1: number;
    num2: number;
};

export const add = ({ num1, num2 }: AddProps) => {
    return num1 + num2;
};
