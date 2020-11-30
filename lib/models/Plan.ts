import { Model, DataTypes } from "sequelize";
import sequelize  from "../SQLiteConfig";

interface PlanAttributes {
    ID?: number;
    name: string;
    label: string;
    price: number;
    productId: string;
    priceId: string;
    selected?: boolean;
}

export class Plan
    extends Model<PlanAttributes>
    implements PlanAttributes {
        public ID?: number;
        public name!: string;
        public label!: string;
        public price!: number;
        public productId!: string;
        public priceId!: string;
    }

Plan.init(
    {
        ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        label: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.NUMBER,
            allowNull: false
        }, 
        productId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        priceId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize
    }
);

(async () => {

    const plans: PlanAttributes[] = [
        {
            name: "Basic Shenanigans",
            label: "Your basic garden variety shenanigans",
            price: 10,
            productId: "prod_ITbAIfT3d4QKuH",
            priceId: "price_1HsdxnCpRlJEvrH6H3vrGE62"
        },
        {
            name: "Standard Shenanigans",
            label: "Your standard level shenanigans, a step up from gaden variety",
            price: 15,
            productId: "prod_ITbAIfT3d4QKuH",
            priceId: "price_1HsdxnCpRlJEvrH6ip9EgutF"
        },
        {
            name: "Legendary Shenanigans",
            label: "Legendary Shenanigans (self-explanatory)",
            price: 20,
            productId: "prod_ITbAIfT3d4QKuH",
            priceId: "price_1HsdxnCpRlJEvrH6E56HmCXu"
        }
    ]

    await sequelize.sync();

    plans.forEach(async (planAttr: PlanAttributes) => {
        if ( ! await Plan.findOne({ where: { priceId: planAttr.priceId}}) ) {
            const plan = Plan.build({...planAttr});
            plan.save();
            console.log(`Plan: ${plan.name} created`)
        }
    })
})();