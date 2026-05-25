import { find } from "es-toolkit/compat";
import { observer } from "mobx-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";
import { toast } from "sonner";
import { IntegrationType, IntegrationService } from "@shared/types";
import type Integration from "~/models/Integration";
import { IntegrationScene } from "~/scenes/Settings/components/IntegrationScene";
import SettingRow from "~/scenes/Settings/components/SettingRow";
import Button from "~/components/Button";
import Heading from "~/components/Heading";
import Input from "~/components/Input";
import Text from "~/components/Text";
import useStores from "~/hooks/useStores";
import Icon from "./Icon";
import Flex from "~/components/Flex";
import styled from "styled-components";
import { disconnectIntegrationFactory } from "~/actions/definitions/integrations";

type FormData = {
  url: string;
};

function DiagramsNet() {
  const { integrations } = useStores();
  const { t } = useTranslation();

  const integration = find(integrations.orderedData, {
    type: IntegrationType.Embed,
    service: IntegrationService.Diagrams,
  }) as Integration<IntegrationType.Embed> | undefined;

  const url = integration?.settings.diagrams?.url;

  const [queryParams, setQueryParams] = React.useState<
    { key: string; value: string }[]
  >([]);

  const {
    register,
    reset,
    handleSubmit: formHandleSubmit,
    formState,
  } = useForm<FormData>({
    mode: "all",
    defaultValues: {
      url,
    },
  });

  React.useEffect(() => {
    reset({
      url,
    });
  }, [reset, url]);

  React.useEffect(() => {
    const queryParamsSettings =
      integration?.settings.diagrams?.queryParams || [];

    setQueryParams(queryParamsSettings);
  }, [integration]);

  const handleSubmit = React.useCallback(
    async (data: FormData) => {
      try {
        await integrations.save({
          id: integration?.id,
          type: IntegrationType.Embed,
          service: IntegrationService.Diagrams,
          settings: {
            diagrams: {
              url: data.url.replace(/\/?$/, "/"),
              queryParams: queryParams,
            },
          } as Integration<IntegrationType.Embed>["settings"],
        });

        toast.success(t("Settings saved"));
      } catch (err) {
        toast.error(err.message);
      }
    },
    [integrations, integration, t, queryParams]
  );

  const onChangeInputKey = (key: string, index: number) => {
    setQueryParams((prev) =>
      prev.map((query, i) => (i === index ? { ...query, key } : query))
    );
  };

  const onChangeInputValue = (value: string, index: number) => {
    setQueryParams((prev) =>
      prev.map((query, i) => (i === index ? { ...query, value } : query))
    );
  };

  return (
    <IntegrationScene title="Diagrams.net" icon={<Icon />}>
      <Heading>Diagrams.net</Heading>

      <Text as="p" type="secondary">
        <Trans>
          Configure a custom Diagrams.net installation URL to use your own
          self-hosted instance for embedding diagrams in your documents.
        </Trans>
      </Text>
      <form onSubmit={formHandleSubmit(handleSubmit)}>
        <SettingRow
          label={t("Installation URL")}
          name="url"
          description={t(
            "The URL of your Diagrams.net installation. Leave empty to use the cloud hosted app.diagrams.net"
          )}
          border={false}
        >
          <Input
            placeholder="https://app.diagrams.net/"
            {...register("url", { required: false })}
          />
        </SettingRow>
        <Label as="h3">{t("Additional Query parameters")}</Label>
        <Text as="p" type="secondary">
          <Trans>
            You can add additional Query parameters to the original one. request
            to receive a chart
          </Trans>
        </Text>
        {queryParams.map(({ key, value }, index) => (
          <Query key={index}>
            <QueryInputs>
              <Input
                placeholder={t("Key")}
                value={key}
                onChange={(e) => onChangeInputKey(e.target.value, index)}
              />
              <Input
                placeholder={t("Value")}
                value={value}
                onChange={(e) => onChangeInputValue(e.target.value, index)}
              />
            </QueryInputs>
            <Button
              hideIcon
              onClick={() =>
                setQueryParams((prev) => prev.filter((_, i) => i !== index))
              }
            >
              {t("Delete")}
            </Button>
          </Query>
        ))}
        <Button
          hideIcon
          onClick={() =>
            setQueryParams((prev) => [...prev, { key: "", value: "" }])
          }
        >
          {t("Add")}
        </Button>
        <Actions reverse justify="end" gap={8}>
          <StyledSubmit
            type="submit"
            // disabled={
            //   !formState.isDirty || !formState.isValid || formState.isSubmitting
            // }
            disabled={!formState.isValid || formState.isSubmitting}
          >
            {formState.isSubmitting ? `${t("Saving")}…` : t("Save")}
          </StyledSubmit>

          <Button
            action={disconnectIntegrationFactory(integration)}
            disabled={formState.isSubmitting}
            neutral
            hideIcon
            hideOnActionDisabled
          >
            {t("Disconnect")}
          </Button>
        </Actions>
      </form>
    </IntegrationScene>
  );
}

const Label = styled(Text)`
  margin-bottom: 4px;
`;

const Actions = styled(Flex)`
  margin-top: 8px;
`;

const StyledSubmit = styled(Button)`
  width: 80px;
`;

const Query = styled.div`
  display: flex;
  justify-content: space-between;
  witdh: 100%;
`;

const QueryInputs = styled.div`
  display: flex;
  gap: 8px;
`;

export default observer(DiagramsNet);
