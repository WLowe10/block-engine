type AddProps = {
    num1: number;
    num2: number;
};

export const add = ({ num1, num2 }: AddProps) => {
    const sum = num1 + num2;

    console.log(`${num1} + ${num2} = ${sum}`);

    return sum;
};
